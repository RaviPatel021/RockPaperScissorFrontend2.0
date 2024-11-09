'use client'

import React, { useState, useCallback, useTransition, useEffect } from 'react'
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Hand, Square, Scissors, Download } from 'lucide-react'

export function RockPaperScissorsComponent() {
  const [userChoice, setUserChoice] = useState('')
  const [computerChoice, setComputerChoice] = useState('')
  const [result, setResult] = useState('')
  const [victories, setVictories] = useState(0)
  const [losses, setLosses] = useState(0)
  const [ties, setTies] = useState(0)
  const [gameHistory, setGameHistory] = useState([])
  const [isButtonDisabled, setIsButtonDisabled] = useState(false)
  const [isRandomChoice, setIsRandomChoice] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [userId, setUserId] = useState('')
  const choices = ['rock', 'paper', 'scissors']

  useEffect(() => {
    const generateUserId = () => {
      return 'user_' + Math.random().toString(36).substr(2, 9)
    }
    const id = generateUserId()
    setUserId(id)
  }, [])

  const debounce = (fn, delay) => {
    let timer
    return (...args) => {
      clearTimeout(timer)
      timer = setTimeout(() => fn(...args), delay)
    }
  }

  const handleClick = useCallback(
    debounce((choice) => {
      setUserChoice(choice)
      setIsButtonDisabled(true)

      if (isRandomChoice) {
        const randomChoice = choices[Math.floor(Math.random() * choices.length)]
        setComputerChoice(randomChoice)
        const outcome = getResult(choice, randomChoice)
        setResult(outcome)
        updateScores(outcome)
        updateGameHistory(choice, randomChoice, outcome, true)

        axios.post(
          'https://rockpaperscissorbackend.onrender.com/play',
          { choice, computer: randomChoice, user_id: userId, random: isRandomChoice },
          {
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            withCredentials: true
          }
        )
        .catch((error) => {
          console.error('Error:', error)
          setResult('Error: Something went wrong! Please try again.')
        })
        .finally(() => {
          setIsButtonDisabled(false)
        })
      } else {
        axios.post(
          'https://rockpaperscissorbackend.onrender.com/play',
          { choice, user_id: userId, random: isRandomChoice },
          {
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            withCredentials: true
          }
        )
        .then((response) => {
          const computer = response.data.computer_choice
          const outcome = response.data.result
          setComputerChoice(computer)
          setResult(outcome)
          updateScores(outcome)
          updateGameHistory(choice, computer, outcome, false)
        })
        .catch((error) => {
          console.error('Error:', error)
          setResult('Error: Something went wrong! Please try again.')
        })
        .finally(() => {
          setIsButtonDisabled(false)
        })
      }
    }, 500),
    [isRandomChoice, userId]
  )

  const getResult = (userChoice, computerChoice) => {
    if (userChoice === computerChoice) return "It's a tie!"
    if (
      (userChoice === 'rock' && computerChoice === 'scissors') ||
      (userChoice === 'scissors' && computerChoice === 'paper') ||
      (userChoice === 'paper' && computerChoice === 'rock')
    ) {
      return 'You win!'
    }
    return 'Computer wins!'
  }

  const updateScores = (outcome) => {
    if (outcome === 'You win!') setVictories((prev) => prev + 1)
    else if (outcome === 'Computer wins!') setLosses((prev) => prev + 1)
    else setTies((prev) => prev + 1)
  }

  const updateGameHistory = (userChoice, computerChoice, result, random) => {
    setGameHistory((prev) => [...prev, { userChoice, computerChoice, result, random }])
  }

  const generateCSV = () => {
    const header = ['User Choice', 'Computer Choice', 'Result', 'Random']
    const rows = gameHistory.map((game) => [game.userChoice, game.computerChoice, game.result, game.random])
    const csvContent = [header, ...rows].map((row) => row.join(',')).join('\n')
    const timestamp = new Date().toISOString().replace(/[:]/g, '-').split('.')[0]
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      link.href = URL.createObjectURL(blob)
      link.download = `game_history_${timestamp}.csv`
      link.click()
    }
  }

  const handleToggleRandom = () => {
    if (window.confirm('Switching modes will reset your score. Do you wish to continue?')) {
      startTransition(() => {
        setIsRandomChoice((prev) => !prev)
        setVictories(0)
        setLosses(0)
        setTies(0)
        setGameHistory([])
        setUserChoice('')
        setComputerChoice('')
        setResult('')
      })
    }
  }

  const totalGames = victories + losses + ties
  const winPercentage = totalGames > 0 ? (victories / totalGames) * 100 : 0
  const lossPercentage = totalGames > 0 ? (losses / totalGames) * 100 : 0
  const tiePercentage = totalGames > 0 ? (ties / totalGames) * 100 : 0

  const getChoiceIcon = (choice) => {
    switch (choice) {
      case 'rock': return <Hand className="w-8 h-8" />
      case 'paper': return <Square className="w-8 h-8" />
      case 'scissors': return <Scissors className="w-8 h-8" />
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Rock Paper Scissors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm font-medium">Random Mode</span>
              <Switch
                checked={isRandomChoice}
                onCheckedChange={handleToggleRandom}
                disabled={isPending}
              />
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {choices.map((choice) => (
                <Button
                  key={choice}
                  onClick={() => handleClick(choice)}
                  disabled={isButtonDisabled}
                  className="h-20 text-lg capitalize flex flex-col items-center justify-center"
                >
                  {getChoiceIcon(choice)}
                  {choice}
                </Button>
              ))}
            </div>
            {userChoice && (
              <div className="text-center mb-4">
                <p className="text-lg font-semibold">Your choice: {userChoice}</p>
                <p className="text-lg font-semibold">Computer's choice: {computerChoice}</p>
                <p className="text-xl font-bold mt-2">{result}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Scoreboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center mb-4">
              <div>
                <p className="text-2xl font-bold text-green-600">{victories}</p>
                <p className="text-sm text-gray-600">Victories</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{losses}</p>
                <p className="text-sm text-gray-600">Losses</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{ties}</p>
                <p className="text-sm text-gray-600">Ties</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Wins</span>
                <span>Losses</span>
                <span>Ties</span>
              </div>
              <div className="relative pt-1">
                <div className="flex h-2 overflow-hidden rounded bg-gray-200 text-xs">
                  <div
                    style={{ width: `${winPercentage}%` }}
                    className="flex flex-col justify-center overflow-hidden bg-green-500 text-white shadow-none"
                  ></div>
                  <div
                    style={{ width: `${lossPercentage}%` }}
                    className="flex flex-col justify-center overflow-hidden bg-red-500 text-white shadow-none"
                  ></div>
                  <div
                    style={{ width: `${tiePercentage}%` }}
                    className="flex flex-col justify-center overflow-hidden bg-yellow-500 text-white shadow-none"
                  ></div>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>{winPercentage.toFixed(1)}%</span>
                <span>{lossPercentage.toFixed(1)}%</span>
                <span>{tiePercentage.toFixed(1)}%</span>
              </div>
            </div>
            <p className="text-center mt-4">Total Games: {totalGames}</p>
          </CardContent>
        </Card>

        {totalGames > 0 && (
          <Button onClick={generateCSV} className="w-full">
            <Download className="mr-2 h-4 w-4" /> Download Game History
          </Button>
        )}
      </div>
    </div>
  )
}