// src/lib/odoo.ts
interface OdooConfig {
    url: string;
    db: string;
    username: string;
    password: string;
  }
  
  interface OdooSession {
    session_id: string;
    context: any;
  }
  
  export class OdooClient {
    private config: OdooConfig;
    private session: OdooSession | null = null;
  
    constructor() {
      this.config = {
        url: process.env.ODOO_URL || '',
        db: process.env.ODOO_DB || '',
        username: process.env.ODOO_USERNAME || '',
        password: process.env.ODOO_PASSWORD || '',
      };
    }
  
    private async authenticate(): Promise<OdooSession> {
      if (this.session) {
        return this.session;
      }
  
      const loginResponse = await fetch(`${this.config.url}/web/session/authenticate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          params: {
            db: this.config.db,
            login: this.config.username,
            password: this.config.password,
          },
        }),
      });
  
      // Extract session cookie
      const setCookie = loginResponse.headers.get('set-cookie');
      if (!setCookie) {
        throw new Error('No session cookie received');
      }
  
      const sessionMatch = setCookie.match(/session_id=([^;]+)/);
      if (!sessionMatch) {
        throw new Error('Invalid session cookie format');
      }
  
      const data = await loginResponse.json();
      if (data.error) {
        throw new Error(data.error.message);
      }
  
      this.session = {
        session_id: sessionMatch[1],
        context: data.result,
      };
  
      return this.session;
    }
  
    async getReportData(blendIdOrName: string | number): Promise<Buffer> {
      try {
        const session = await this.authenticate();
  
        let blendId = typeof blendIdOrName === 'number' ? blendIdOrName : 0;
  
        // If name is provided, search for the ID
        if (typeof blendIdOrName === 'string') {
          const searchResponse = await fetch(`${this.config.url}/web/dataset/call_kw/tea.blend/search`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cookie': `session_id=${session.session_id}`,
            },
            body: JSON.stringify({
              jsonrpc: '2.0',
              params: {
                model: 'tea.blend',
                method: 'search',
                args: [[['name', '=', blendIdOrName]]],
                kwargs: {},
              },
            }),
          });
  
          const searchData = await searchResponse.json();
          if (!searchData.result || !searchData.result.length) {
            throw new Error(`No blend found with name ${blendIdOrName}`);
          }
          blendId = searchData.result[0];
        }
  
        // First, get the report action
        const actionResponse = await fetch(`${this.config.url}/web/action/load`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': `session_id=${session.session_id}`,
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            params: {
              action_id: 'blend_line.action_report_tea_blend',
            },
          }),
        });
  
        // Generate report
        const reportResponse = await fetch(`${this.config.url}/report/download`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': `session_id=${session.session_id}`,
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            params: {
              report_name: 'blend_line.report_tea_blend',
              report_type: 'qweb-pdf',
              data: {
                model: 'tea.blend',
                ids: [blendId],
                context: session.context,
              },
            },
          }),
        });
  
        if (!reportResponse.ok) {
          throw new Error(`Failed to generate report: ${reportResponse.statusText}`);
        }
  
        const arrayBuffer = await reportResponse.arrayBuffer();
        return Buffer.from(arrayBuffer);
      } catch (error) {
        console.error('Error getting report data:', error);
        throw error;
      }
    }
  }