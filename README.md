
# Car Assistant

OpenAI Realtime API / Agents SDK を試すために作った実験用プロジェクトです。

車両の現在位置・進行方向をもとに、
前方に存在する標識のみを抽出して音声警告を行います。

Realtime Voice Agent と UI state 管理をどこまで自然に扱えるかを確認したくて作っています。

まだ prototype 段階です。

---

## やっていること

- realtime 音声対話
- 車両シミュレーション
- direction based warning
- proximity filtering
- map rendering
- session state 管理

---

## 実装メモ

最初は geospatial library を使う方向で試していましたが、
prototype に対して構成が重くなりすぎたので、
現在は単純な grid ベースの simulation に寄せています。

必要だったのは厳密な地理計算よりも、

- low latency
- warning の安定性
- interruption handling
- reconnect 制御

だったため、
今の構成の方が扱いやすかったです。

また、warning 対象については単純な距離判定だけではなく、
車両の進行方向も見ています。

北方向へ進んでいる場合、
車両より後方にある標識は warning 対象から除外しています。

完全ではないですが、
不要 warning をかなり減らせました。

---

## 起動

```bash
npm install
npm run dev
```

```bash
http://localhost:3000
```

---

## 構成

```txt
/app
/components
/lib
```

今は feature ごとに細かく分けすぎず、
必要最小限の構成にしています。

---

## known issues

- reconnect 後に audio state がズレることがある
- Safari の mic 周りがまだ不安定
- 急旋回時に warning が重複するケースあり
- session reconnect 時に agent が喋り続けることがある

---

## TODO

- spatial index 導入検討
- warning queue 整理
- audio interruption 改善
- reconnect handling 改善
- map rendering 最適化

---

## 技術

- Next.js
- TypeScript
- OpenAI Agents SDK

---

## 補足

本物の navigation system を作りたいわけではなく、
Realtime Agent と UI / state 管理を試すのが主目的です。

なので map 周りは意図的に単純化しています。

---