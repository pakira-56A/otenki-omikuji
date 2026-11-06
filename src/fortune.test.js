import { describe, expect, it } from "vitest"
import { getFortuneResult, getWeatherImages } from "./fortune"

describe("getFortuneResult（天気の文字 → おみくじ）", () => {
  const cases = [
    ["晴れ", 5, "/images/晴れ.png"],
    ["晴れ時々曇り", 4, "/images/曇り.png"],
    ["曇り", 3, "/images/曇り.png"],
    ["曇り時々雨", 3, "/images/曇りと雨.png"],
    ["雨", 3, "/images/雨.png"],
    ["雪", 2, "/images/雪.png"],
    ["風雪強い", 2, "/images/吹雪.png"],
    ["暴風雪", 2, "/images/吹雪.png"],
    ["霧", 2, "/images/霧.png"],
    ["雷", 1, "/images/雷.png"],
  ]
  for (const [weather, luck, imagePath] of cases) {
    it(`${weather} → ラッキー度${luck}`, () => {
      const fortune = getFortuneResult(weather)
      expect(fortune.luck).toBe(luck)
      expect(fortune.imagePath).toBe(imagePath)
    })
  }

  it("晴れに雨が混ざると、晴れ（ラッキー度5）ではなく雨の扱い（3）になる", () => {
    expect(getFortuneResult("晴れ一時雨").luck).toBe(3)
  })

  it("どれにも当てはまらない天気（「不明」など）は、初期のメッセージでラッキー度3", () => {
    const fortune = getFortuneResult("不明")
    expect(fortune.luck).toBe(3)
    expect(fortune.message).toContain("変わりやすい天気")
  })

  it("ラッキー度は、どの結果でも 0〜5 に収まる（クローバーの数が負にならない）", () => {
    for (const [weather] of cases) {
      const { luck } = getFortuneResult(weather)
      expect(luck).toBeGreaterThanOrEqual(0)
      expect(luck).toBeLessThanOrEqual(5)
    }
  })
})

describe("getWeatherImages（天気の文字 → 表示する画像）", () => {
  it("ふつうの天気は画像1枚", () => {
    expect(getWeatherImages("晴れ")).toEqual({ type: "single", imagePath: "/images/晴れ.png" })
  })

  it("「のち」は前→後の2枚", () => {
    expect(getWeatherImages("晴れのち雨")).toEqual({
      type: "transition",
      firstImagePath: "/images/晴れ.png",
      secondImagePath: "/images/雨.png",
      symbol: "→",
    })
  })

  it("「を伴う」は主な天気＋伴う天気の2枚", () => {
    expect(getWeatherImages("雨で雷を伴う")).toEqual({
      type: "accompanying",
      firstImagePath: "/images/雨.png",
      secondImagePath: "/images/雷.png",
      symbol: "+",
    })
  })

  it("知らない天気は曇りの画像にする", () => {
    expect(getWeatherImages("不明")).toEqual({ type: "single", imagePath: "/images/曇り.png" })
  })
})
