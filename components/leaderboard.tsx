'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface LeaderboardEntry {
    userId: string;
    UserName: string;
    wins: number;
    losses: number;
    ties: number;
    total: number;
}

export function Leaderboard({ userId }: { userId: string }) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get('http://10.0.103.145:5000/leaderboard')
        setLeaderboard(response.data)
      } catch (error) {
        console.error('Error fetching leaderboard:', error)
      }
    }

    fetchLeaderboard()

    // Set up polling to update the leaderboard every 10 seconds
    const intervalId = setInterval(fetchLeaderboard, 10000)

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId)
  }, [])

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Wins</TableHead>
              <TableHead>Losses</TableHead>
              <TableHead>Ties</TableHead>
              <TableHead>Total Games</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboard.map((entry, index) => (
              <TableRow key={entry.userId} className={entry.userId === userId ? "bg-primary/10" : ""}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{entry.UserName}</TableCell>
              <TableCell>{entry.wins}</TableCell>
              <TableCell>{entry.losses}</TableCell>
              <TableCell>{entry.ties}</TableCell>
              <TableCell>{entry.total}</TableCell>
            </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}