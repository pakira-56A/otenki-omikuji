import { getWeatherTextFromCode } from "./Codes.jsx"

const isObject = (value) => typeof value === "object" && value !== null

// 気象庁の応答が想定した形か確かめる。違えばわかりやすいエラーにする
const assertShape = (condition, message) => {
  if (!condition) throw new Error(`気象庁データの形が想定と違う: ${message}`)
}

const matchesRegion = (item, regionName, regionCode) =>
  isObject(item) && isObject(item.area) && (item.area.name === regionName || item.area.code === regionCode)

const toNumberOrNull = (value) => {
  const number = Number.parseInt(value)
  return Number.isNaN(number) ? null : number
}

// 気象庁の予報JSONから、おみくじに使う値を取り出す
export const parseForecast = (data, regionCode, regionName) => {
  assertShape(Array.isArray(data) && isObject(data[0]), "先頭の要素がない")
  const timeSeriesData = data[0].timeSeries
  assertShape(Array.isArray(timeSeriesData) && timeSeriesData.length > 0, "timeSeriesがない")

  const weatherForecast = timeSeriesData[0]
  assertShape(
    isObject(weatherForecast) &&
      Array.isArray(weatherForecast.timeDefines) &&
      weatherForecast.timeDefines.length > 0 &&
      Array.isArray(weatherForecast.areas) &&
      weatherForecast.areas.length > 0,
    "天気予報の時間・地域がない",
  )

  // 気温予報。3番目のデータがないなら、2番目のデータを使う
  const temperatureForecast = timeSeriesData[2] || timeSeriesData[1]

  // 気象庁の日時は日本時間（例 2026-11-06T05:00:00+09:00）。UTCに直すと日付がずれるので、先頭の日付部分をそのまま使う
  const dateText = String(weatherForecast.timeDefines[0]).slice(0, 10)
  assertShape(/^\d{4}-\d{2}-\d{2}$/.test(dateText) && !Number.isNaN(Date.parse(dateText)), "日付が読めない")

  // 地域に対応する天気コードを探す。見つからなければ先頭の地域を使う
  const area = weatherForecast.areas.find((item) => matchesRegion(item, regionName, regionCode))
  const targetArea = area || weatherForecast.areas[0]
  assertShape(isObject(targetArea) && Array.isArray(targetArea.weatherCodes) && targetArea.weatherCodes.length > 0, "weatherCodesがない")
  const weatherCode = targetArea.weatherCodes[0]

  let maxTemp = null
  let minTemp = null

  if (isObject(temperatureForecast) && Array.isArray(temperatureForecast.areas) && temperatureForecast.areas.length > 0) {
    const foundArea = temperatureForecast.areas.find((item) => matchesRegion(item, regionName, regionCode))
    const tempArea = foundArea || temperatureForecast.areas[0]

    if (isObject(tempArea) && Array.isArray(tempArea.temps)) {
      maxTemp = toNumberOrNull(tempArea.temps[1])
      minTemp = toNumberOrNull(tempArea.temps[0])
    } else if (isObject(tempArea) && Array.isArray(tempArea.tempsMax) && Array.isArray(tempArea.tempsMin)) {
      maxTemp = toNumberOrNull(tempArea.tempsMax[0])
      minTemp = toNumberOrNull(tempArea.tempsMin[0])
    }
  }

  return {
    region: regionName,
    date: dateText,
    weather: getWeatherTextFromCode(weatherCode),
    weatherCode,
    temperature: { max: maxTemp, min: minTemp },
  }
}
