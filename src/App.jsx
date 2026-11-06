"use client"

import { useState } from "react"
import "./App.css"
import RouletteWheel from "./components/RouletteWheel"
import WeatherFortune from "./components/WeatherFortune"
import Header from "./components/Header"
import { regionCodes } from "./Codes.jsx"
import { parseForecast } from "./weather"

function App() {
  const [isSpinning, setIsSpinning] = useState(false)    // 初期値はルーレットが回転していない
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [weatherData, setWeatherData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // 地域名リストを生成する
  const regions = Object.keys(regionCodes)

  const startRoulette = () => {
    setIsSpinning(true)     // ルーレット回転中
    setSelectedRegion(null)
    setWeatherData(null)
    setError(null)
  }

  // ルーレットをストップし、天気データを取得
  const stopRoulette = async () => {  // asyncで非同期関数
    if (!isSpinning) return           // ルーレット非回転だとreturn

    setIsLoading(true)

    // ランダムに地域を選択
    const randomRegionIndex = Math.floor(Math.random() * regions.length) // 地域名リストから、ランダムなインデックスを生成
    const region            = regions[randomRegionIndex]   // ランダムに選択した地域名 を設定
    const regionCode        = regionCodes[region]          // 選択した地域に対応する地域コード を設定

    setSelectedRegion(region)

    try {  // エラー対策を以下に記載する宣言
      // awaitでPromise が解決されるまで処理を一時停止し、結果を待つ
      const weatherData = await fetchWeatherForecast(regionCode, region)
      setWeatherData(weatherData)
    } catch (err) {
      console.error("天気データの取得に失敗", err)
      setError("天気データの取得に失敗！もっかい試してみて！")
    }

    setIsSpinning(false)
    setIsLoading(false)
  }

  const fetchWeatherForecast = async (regionCode, regionName) => {
    // 気象庁の予報JSONを取得
    const response = await fetch(`https://www.jma.go.jp/bosai/forecast/data/forecast/${regionCode}.json`)
    if (!response.ok) {
      throw new Error(`APIリクエスト: ${response.status}`)
    }
    const data = await response.json()
    // 応答の形を確かめながら、必要な値だけ取り出す（形が違えばエラーになる）
    return parseForecast(data, regionCode, regionName)
  }

  return (
    <div className="app-container">
      <Header />

      <main>
        <div className="roulette-container">
          <RouletteWheel
            regions={regions}
            isSpinning={isSpinning}
            selectedRegion={selectedRegion}
          />
        </div>

        <div className="controls">
          <button
            onClick={startRoulette}
            disabled={isSpinning || isLoading}
            className="control-button start-button"
          >スタート</button>
          <button
            onClick={stopRoulette}
            disabled={!isSpinning || isLoading}
            className="control-button stop-button"
          >ストップ</button>
        </div>

        {isLoading && (<div className="loading">気象庁さんのデータを探し中...</div>)}
        {error && <div className="error-message">{error}</div>}
        {weatherData && <WeatherFortune weatherData={weatherData} />}
      </main>
    </div>
  )
}

export default App
