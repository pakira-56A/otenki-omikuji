import { XShareButton } from "../styles/xShareButton"
import "./WeatherFortune.css"
import { getFortuneResult, getWeatherImages } from "../fortune"

function WeatherFortune({ weatherData }) {
  const handleImageError = (event, path) => {
    console.error(`画像の読み込みに失敗: ${path}`)
    event.target.src = "/images/曇り.png"
    event.target.alt = "画像が見つかんないよー"
  }

  // お天気データを基におみくじ結果を取得
  const fortune = getFortuneResult(weatherData.weather)
  const weatherImages = getWeatherImages(weatherData.weather)

  // クローバーの数を表示
  const renderClovers = (luck) => (
    <>
      {[...Array(luck)].map((_, i) => (      // ループを使って、運の数に応じた充填されたクローバーを生成
        <span key={`filled-${i}`} className="clover filled">🍀</span>
      ))}
      {[...Array(5 - luck)].map((_, i) => (  // 最大5つから運の数を引いた数の、空のクローバーを生成
        <span key={`empty-${i}`} className="clover empty">🍀</span>
      ))}
    </>
  )

  const formatDate = (dateString) => {
    const date = new Date(dateString)  // 日付オブジェクトに変換
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
  }

  return (
    <div className="weather-fortune">
      <div className="fortune-card">
        <div className="fortune-header">
          <span className="region-date">
            {/* 日付をフォーマットし、地域情報を表示 */}
            {formatDate(weatherData.date)} {weatherData.region}
          </span>

          {weatherData.weather}
          {/* 最大温度・最小温度があるなら、表示 */}
          {weatherData.temperature.max !== null && weatherData.temperature.min !== null
            ? ` ${weatherData.temperature.max}℃〜${weatherData.temperature.min}℃`
            : "" }
        </div>

        <div className="weather-image-container">
          {weatherImages.type !== "single" ? (
            <>
              <img  src={weatherImages.firstImagePath || "/placeholder.svg"}
                    alt={weatherImages.firstWeather}
                    className="weather-image combined-image"
                    onError={(e) =>
                      handleImageError(e, weatherImages.firstImagePath)} />

              <span className="weather-symbol">{weatherImages.symbol}</span>

              <img  src={weatherImages.secondImagePath || "/placeholder.svg"}
                    alt={weatherImages.secondWeather}
                    className="weather-image combined-image"
                    onError={(e) =>
                      handleImageError(e, weatherImages.secondImagePath) } />
            </>
          )
          : (   // 単一の天気画像や、おみくじの画像（fortune）を使いう
            <img  src={weatherImages.imagePath || fortune.imagePath}
                  alt={fortune.result}
                  className="weather-image"
                  onError={(e) =>
                    handleImageError(
                      e,
                      weatherImages.imagePath || fortune.imagePath
                    )
                  }
            />
          )
        }
        </div>
        <span style={{ color: "green" }}>ラッキー度</span>
        <div className="fortune-clovers">{renderClovers(fortune.luck)}</div>
        <p className="fortune-message">{fortune.message}</p>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <XShareButton weatherData={weatherData} fortune={fortune} />
        </div>
      </div>
    </div>
  )
}

export default WeatherFortune
