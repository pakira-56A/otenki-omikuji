import { describe, expect, it } from "vitest"
import { parseForecast } from "./weather"

// 気象庁の予報JSONを小さくした見本。実データと同じ入れ子の形にしてある
const makeForecast = (overrides = {}) => [
  {
    timeSeries: [
      {
        timeDefines: ["2026-11-06T11:00:00+09:00", "2026-11-07T00:00:00+09:00"],
        areas: [
          { area: { name: "北部", code: "270010" }, weatherCodes: ["100", "101"] },
          { area: { name: "大阪府", code: "270000" }, weatherCodes: ["101", "200"] },
        ],
      },
      { timeDefines: [], areas: [] },
      {
        timeDefines: ["2026-11-06T09:00:00+09:00"],
        areas: [{ area: { name: "大阪", code: "62078" }, temps: ["12", "23"] }],
      },
    ],
    ...overrides,
  },
]

describe("parseForecast", () => {
  it("地域名が合う予報から、日付・天気・気温を取り出す", () => {
    const result = parseForecast(makeForecast(), "270000", "大阪府")
    expect(result).toEqual({
      region: "大阪府",
      date: "2026-11-06",
      weather: "晴れ時々曇り",
      weatherCode: "101",
      temperature: { max: 23, min: 12 },
    })
  })

  it("日付は日本時間の日付のまま（朝5時でも前日にならない）", () => {
    const data = makeForecast()
    data[0].timeSeries[0].timeDefines[0] = "2026-11-06T05:00:00+09:00"
    expect(parseForecast(data, "270000", "大阪府").date).toBe("2026-11-06")
  })

  it("地域が見つからないときは、先頭の地域の天気を使う", () => {
    const result = parseForecast(makeForecast(), "999999", "存在しない地域")
    expect(result.weatherCode).toBe("100")
    expect(result.region).toBe("存在しない地域")
  })

  it("天気コードが表に無いときは「不明」になる", () => {
    const data = makeForecast()
    data[0].timeSeries[0].areas[1].weatherCodes = ["999"]
    expect(parseForecast(data, "270000", "大阪府").weather).toBe("不明")
  })

  it("気温が tempsMax／tempsMin の形でも読める", () => {
    const data = makeForecast()
    data[0].timeSeries[2].areas = [{ area: { name: "大阪", code: "62078" }, tempsMax: ["", "20"], tempsMin: ["8", ""] }]
    expect(parseForecast(data, "270000", "大阪府").temperature).toEqual({ max: null, min: 8 })
  })

  it("気温の欄が無いときは null になる", () => {
    const data = makeForecast()
    data[0].timeSeries = data[0].timeSeries.slice(0, 1)
    expect(parseForecast(data, "270000", "大阪府").temperature).toEqual({ max: null, min: null })
  })

  it("気温が 0℃ のときは 0 のまま返す（欠測の null にしない）", () => {
    const data = makeForecast()
    data[0].timeSeries[2].areas[0].temps = ["0", "0"]
    expect(parseForecast(data, "270000", "大阪府").temperature).toEqual({ max: 0, min: 0 })
  })

  it("数字でない気温は null になる", () => {
    const data = makeForecast()
    data[0].timeSeries[2].areas[0].temps = ["--", "abc"]
    expect(parseForecast(data, "270000", "大阪府").temperature).toEqual({ max: null, min: null })
  })

  describe("形が想定と違うデータはエラーにする", () => {
    const cases = {
      "配列でない": {},
      "空の配列": [],
      "timeSeries が無い": [{}],
      "timeSeries が空": [{ timeSeries: [] }],
      "timeDefines が空": makeForecast({ timeSeries: [{ timeDefines: [], areas: [{}] }] }),
      "areas が空": makeForecast({ timeSeries: [{ timeDefines: ["2026-11-06T11:00:00+09:00"], areas: [] }] }),
      "日付が読めない": makeForecast({ timeSeries: [{ timeDefines: ["あした"], areas: [{ weatherCodes: ["100"] }] }] }),
      "weatherCodes が無い": makeForecast({ timeSeries: [{ timeDefines: ["2026-11-06T11:00:00+09:00"], areas: [{ area: {} }] }] }),
    }
    for (const [name, data] of Object.entries(cases)) {
      it(name, () => {
        expect(() => parseForecast(data, "270000", "大阪府")).toThrow("気象庁データの形が想定と違う")
      })
    }
  })
})
