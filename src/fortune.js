// 天気の文字から、おみくじの結果と表示する画像を決める（画面に依存しない関数）

// 与えられた天気のテキストから、天気画像のパスを取得させる
const getWeatherImagePath = (weatherText) => {
  const weatherImages = {
    晴れ: "/images/晴れ.png",
    曇り: "/images/曇り.png",
    雨:   "/images/雨.png",
    雪:   "/images/雪.png",
    霧:   "/images/霧.png",
    雷:   "/images/雷.png",
    吹雪: "/images/吹雪.png"
  }
  // 天気画像のキー（天気の状態）をループ処理
  for (const weather of Object.keys(weatherImages)) {
    if (weatherText.includes(weather)) { // 天気テストが、ループ中の天気の状態を含んでたら
      return weatherImages[weather]
    }
  }
  return "/images/曇り.png" // デフォルト
}

// 特定の天気キーワードを抽出
const extractWeatherKeyword = (text) => {
  const keywords = ["晴れ", "曇り", "雨", "雪", "霧", "雷", "吹雪"]
  for (const keyword of keywords) {  // 定義したキーワードをループ
    if (text.includes(keyword)) {    // 指定された text が現在の keyword を含んでたら
      return keyword                 // 一致したキーワードを返す
    }
  }
  return "曇り" // デフォルト
}

export const getFortuneResult = (weather) => {
  const defaultMessage = "変わりやすい天気だね！！君の柔軟な心で、どんな日も楽しめるよ！✨"
  const fortuneMessages = {
    sunshine:     { message: "あっぱれ！才能が開花してキラキラ輝く日✨新しい事どんどんチャレンジしーちゃお🥳",
                    imagePath: "/images/晴れ.png",
                    luck: 5 },
    sunAndClouds: { message: "君の持ち前の明るさで、きっと晴れ間が見えるよ！☀️チャンス掴んじゃお！",
                    imagePath: "/images/曇り.png",
                    luck: 4 },
    cloudy:       { message: "雲の上はいつも晴れてるんだって☀️自分を見つめ直すチャンスかも！心の整理をしてスッキリしよ☺️",
                    imagePath: "/images/曇り.png",
                    luck: 3 },
    rainAndClouds:{ message: "雨降って地固まる、発想力が冴える日✨創作や学びのチャンス！新しい発見しーちゃおう💃",
                    imagePath: "/images/曇りと雨.png",
                    luck: 3 },
    rain:         { message: "雨の日は浄化のタイミング🌧️余計なものを手放して心をスッキリさせちゃお！🍵",
                    imagePath: "/images/雨.png",
                    luck: 3 },
    heavySnow:    { message: "今日は無理しないで！たまにはお家でゆっくり心を整えるのが吉✨心と体を温めて休もう🫕",
                    imagePath: "/images/吹雪.png",
                    luck: 2 },
    snow:         { message: "雪の真っ白なきもちで心をリセット！新しいスタートを切るチャンス！穏やかに過ごしてみよう☺️",
                    imagePath: "/images/雪.png",
                    luck: 2 },
    fog:          { message: "視界がぼんやりでも大丈夫！九星気学的に直感が冴える日✨自分を信じて焦らずゆっくり進もう🏃‍♀️",
                    imagePath: "/images/霧.png",
                    luck: 2 },
    thunder:      { message: "雷は運気の転換期⚡九星気学では新しいステージの始まり！ビビらずワクワクしてこう！😊",
                    imagePath: "/images/雷.png",
                    luck: 1 }
  }

  // 晴れで、雲り・雨・雪が含まれないなら
  if ( weather.includes("晴れ") && !weather.includes("曇り") && !weather.includes("雨") && !weather.includes("雪") ) {
    return fortuneMessages.sunshine
  }
  // 晴れと曇りを含むなら
  else if ( weather.includes("晴れ") && weather.includes("曇り") ) {
    return fortuneMessages.sunAndClouds
  }
  // 曇りで、雨・雪を含まないなら
  else if ( weather.includes("曇り") && !weather.includes("雨") && !weather.includes("雪") ) {
    return fortuneMessages.cloudy
  }
  // 雨と曇りを含むなら
  else if ( weather.includes("雨") && weather.includes("曇り") ) {
    return fortuneMessages.rainAndClouds
  }
  else if ( weather.includes("雨") ) {
    return fortuneMessages.rain
  }
  // 雪で、「強い」「暴風」が含むなら
  else if ( weather.includes("雪") && (weather.includes("強い") || weather.includes("暴風")) ) {
    return fortuneMessages.heavySnow
  }
  else if ( weather.includes("雪") ) {
    return fortuneMessages.snow
  }
  else if ( weather.includes("霧") ) {
    return fortuneMessages.fog
  }
  else if ( weather.includes("雷") ) {
    return fortuneMessages.thunder
  }
  else {
    return {result: weather, imagePath: "/images/曇り.png", message: defaultMessage, luck: 3 }
  }
}

// 天気の表示タイプを決め、画像パスを取得
export const getWeatherImages = (weather) => {
  if ( weather.includes("のち") ) {
    const [firstWeather, secondWeather] = weather.split("のち")
    return {type: "transition",     // 遷移タイプの天気だと示す
            firstImagePath:  getWeatherImagePath(firstWeather),
            secondImagePath: getWeatherImagePath(secondWeather),
            symbol: "→"
    }
  }
  else if ( weather.includes("を伴う") ) {
    // 「で」区切りで最初の部分から主要な天気を抽出
    const mainWeather = extractWeatherKeyword(weather.split("で")[0])
    // 主要な天気の後に続く天気を抽出
    const accompanyingWeather = extractWeatherKeyword( weather.split("を伴う")[0].split("で")[1] || weather )

    return {type: "accompanying",  // 伴う
            firstImagePath:  getWeatherImagePath(mainWeather),
            secondImagePath: getWeatherImagePath(accompanyingWeather),
            symbol: "+"
    }
  }
  else {
    return {type: "single",
            imagePath: getWeatherImagePath(weather)
    }
  }
}
