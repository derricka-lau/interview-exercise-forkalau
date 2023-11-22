"use client"

import { openDayData } from '@/data/OpenDay'
import { useMemo, useState } from 'react'

export default function Home() {
  const [selectedTab, setSelectedTab] = useState<number | null>(null)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<string>('asc')
  const [searchTerm, setSearchTerm] = useState<string>('')

  const handleTabClick = (topicId: number) => {
    setSelectedTab((prevTab) => (prevTab === topicId ? null : topicId))
  }

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection((prevDir) => (prevDir === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const parseDateString = (dateString: string) => {
    const [datePart, timePart] = dateString.split(' ')
    const [year, month, day] = datePart.split('-').map(Number)
    const [hour, minute, second] = timePart.split(':').map(Number)
    return new Date(year, month - 1, day, hour, minute, second)
  }

  const filteredPrograms = useMemo(() => {
    if (selectedTab) {
      return openDayData.topics
      .find((topic) => topic.id === selectedTab)
      ?.programs.filter((program) =>
        program.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
  }
  , [searchTerm, selectedTab])

  const sortedPrograms = useMemo(() => {
    if (filteredPrograms && sortColumn) {
      return filteredPrograms.sort((a, b) => {
        let valueA = a[sortColumn as keyof typeof a]
        let valueB = b[sortColumn as keyof typeof b]
        if (typeof valueA === 'string' && typeof valueB === 'string') {
          if (sortColumn === 'start_time' || sortColumn === 'end_time') {
            const parsedDate1 = parseDateString(valueA)
            const parsedDate2 = parseDateString(valueB)
            if (sortDirection === 'asc') {
              return parsedDate1 > parsedDate2 ? -1 : 1
            } else {
              return parsedDate1 < parsedDate2 ? -1 : 1
            }
          }
          
          if (sortColumn === 'location') {
            valueA = a.location.title
            valueB = b.location.title
          }

          if (sortDirection === 'asc') {
            return valueA.localeCompare(valueB)
          } else {
            return valueB.localeCompare(valueA)
          } 
        }
        return 1
      })
    } else {
      return filteredPrograms
    }
  }, [filteredPrograms, sortColumn, sortDirection])

  return (
    <div className="container mx-auto py-8">
      <h1 className="flex justify-center text-2xl mb-4">Topics</h1>
      <div className="flex flex-wrap">
        {openDayData.topics.map((topic) => (
          <div
            key={topic.id}
            onClick={() => handleTabClick(topic.id)}
            className={`cursor-pointer px-2 py-1 border border-gray-300 rounded-t-lg mb-2 mr-2 ${selectedTab === topic.id ? 'bg-blue-500 text-white' : ''
              }`}
            style={{ maxWidth: '150px' }}
          >
            {topic.name}
          </div>
        ))}
      </div>

      <div className="mt-4">
        <input
          type="text"
          placeholder="Search by programme title"
          className="w-1/2 border border-gray-300 p-2 rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <table className="mt-4 w-full table-auto">
          <thead>
            <tr>
              <th
                onClick={() => handleSort('title')}
                className="cursor-pointer"
              >
                Program Title
              </th>
              <th
                onClick={() => handleSort('start_time')}
                className="cursor-pointer">Start Time</th>
              <th
                onClick={() => handleSort('end_time')}
                className="cursor-pointer">End Time</th>
              <th onClick={() => handleSort('location')}
                className="cursor-pointer">Location</th>
            </tr>
          </thead>
          <tbody>
            {sortedPrograms?.map((program) => (
              <tr key={program.id}>
                <td>{program.title}</td>
                <td>{program.start_time}</td>
                <td>{program.end_time}</td>
                <td>{program.location.title}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
