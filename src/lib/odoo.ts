// src/lib/odoo.ts
interface OdooConfig {
    url: string;
    db: string;
    username: string;
    password: string;
  }
  
  export class OdooClient {
    private config: OdooConfig;
    private uid: number | null = null;
  
    constructor() {
      this.config = {
        url: process.env.ODOO_URL || 'https://teatang-tt-pre-costing-15943584.dev.odoo.com',
        db: process.env.ODOO_DB || 'teatang-tt-pre-costing-15943584',
        username: process.env.ODOO_USERNAME || 'admin@teatang.com',
        password: process.env.ODOO_PASSWORD || 'ttpl@2025',
      };
    }
  
    private async authenticate(): Promise<number> {
      const response = await fetch(`${this.config.url}/web/session/authenticate`, {
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
  
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message);
      }
  
      this.uid = data.result.uid;
      return this.uid;
    }
  
    private async callKw(model: string, method: string, args: any[], kwargs: any = {}): Promise<any> {
      if (!this.uid) {
        await this.authenticate();
      }
  
      const response = await fetch(`${this.config.url}/web/dataset/call_kw/${model}/${method}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          params: {
            model,
            method,
            args,
            kwargs,
          },
        }),
      });
  
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message);
      }
  
      return data.result;
    }
  
    async getReportData(blendIdOrName: string | number): Promise<Buffer> {
      try {
        await this.authenticate();
  
        let blendId = typeof blendIdOrName === 'number' ? blendIdOrName : 0;
  
        // If name is provided, search for the ID
        if (typeof blendIdOrName === 'string') {
          const searchResult = await this.callKw('tea.blend', 'search', [[['name', '=', blendIdOrName]]]);
          if (!searchResult.length) {
            throw new Error(`No blend found with name ${blendIdOrName}`);
          }
          blendId = searchResult[0];
        }
  
        // Generate report using Odoo's report endpoint
        const response = await fetch(`${this.config.url}/report/pdf/blend_line.report_tea_blend/${blendId}`, {
          method: 'GET',
          headers: {
            'Cookie': `session_id=${this.uid}`,
          },
        });
  
        if (!response.ok) {
          throw new Error(`Failed to generate report: ${response.statusText}`);
        }
  
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
      } catch (error) {
        console.error('Error getting report data:', error);
        throw error;
      }
    }
  }