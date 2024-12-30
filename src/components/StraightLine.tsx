import React from 'react'
import { Input } from './ui/input'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'
import { Label } from './ui/label'
import ThemeToggle from './ThemeToggle'

function StraightLine() {
  const [formData, setFormData] = React.useState({
    field1: '',
    field2: '',
    field3: '',
    field4: '',
    field5: '',
    field6: '',
    field7: '',
    field8: '',
  })

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const { name, value } = event.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Utilization of Straight line</CardTitle>
        </CardHeader>
        <CardContent className=" space-y-4">
          <div className="search-bar m-auto flex justify-center">
            <Input placeholder="Search Here...." className="w-1/2 " />
            <button className="ml-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex flex-1 items-center gap-2">
                <Label htmlFor="field1" className="w-16">
                  Field 1
                </Label>
                <Input
                  id="field1"
                  name="field1"
                  value={formData.field1}
                  onChange={handleInputChange}
                  placeholder="Field 1"
                  className="flex-1"
                />
              </div>
              <div className="flex flex-1 items-center gap-2">
                <Label htmlFor="field2" className="w-16">
                  Field 2
                </Label>
                <Input
                  id="field2"
                  name="field2"
                  value={formData.field2}
                  onChange={handleInputChange}
                  placeholder="Field 2"
                  className="flex-1"
                />
              </div>
              <div className="flex flex-1 items-center gap-2">
                <Label htmlFor="field3" className="w-16">
                  Field 3
                </Label>
                <Input
                  id="field3"
                  name="field3"
                  value={formData.field3}
                  onChange={handleInputChange}
                  placeholder="Field 3"
                  className="flex-1"
                />
              </div>
              <div className="flex flex-1 items-center gap-2">
                <Label htmlFor="field4" className="w-16">
                  Field 4
                </Label>
                <Input
                  id="field4"
                  name="field4"
                  value={formData.field4}
                  onChange={handleInputChange}
                  placeholder="Field 4"
                  className="flex-1"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex flex-1 items-center gap-2">
                <Label htmlFor="field5" className="w-16">
                  Field 5
                </Label>
                <Input
                  id="field5"
                  name="field5"
                  value={formData.field5}
                  onChange={handleInputChange}
                  placeholder="Field 5"
                  className="flex-1"
                />
              </div>
              <div className="flex flex-1 items-center gap-2">
                <Label htmlFor="field6" className="w-16">
                  Field 6
                </Label>
                <Input
                  id="field6"
                  name="field6"
                  value={formData.field6}
                  onChange={handleInputChange}
                  placeholder="Field 6"
                  className="flex-1"
                />
              </div>
              <div className="flex flex-1 items-center gap-2">
                <Label htmlFor="field7" className="w-16">
                  Field 7
                </Label>
                <Input
                  id="field7"
                  name="field7"
                  value={formData.field7}
                  onChange={handleInputChange}
                  placeholder="Field 7"
                  className="flex-1"
                />
              </div>
              <div className="flex flex-1 items-center gap-2">
                <Label htmlFor="field8" className="w-16">
                  Field 8
                </Label>
                <Input
                  id="field8"
                  name="field8"
                  value={formData.field8}
                  onChange={handleInputChange}
                  placeholder="Field 8"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <div className="tables">
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Purchasing Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Item 1</TableCell>
                        <TableCell>100</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Item 2</TableCell>
                        <TableCell>200</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Item 1</TableCell>
                        <TableCell>100</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Item 2</TableCell>
                        <TableCell>200</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Blend Allocation Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Item 1</TableCell>
                      <TableCell>100</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Item 2</TableCell>
                      <TableCell>200</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <div className="mt-4 flex items-center gap-4">
              <Card className="flex-1">
                <CardHeader>
                  <CardTitle>Switch</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Item 1</TableCell>
                        <TableCell>100</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Item 2</TableCell>
                        <TableCell>200</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default StraightLine
