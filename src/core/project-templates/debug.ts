import { ProjectData } from "@/types/ProjectData"

const project: ProjectData = {
  title: "Debug Project",
  workspace: {
    selectedGameObjectKey: "player",
    selectedLibrarySpriteKey: null,
    advanced: true
  },
  sprites: {
    "player-walk-1": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEQAAABdCAYAAAAcysDhAAAJB0lEQVR42u2ca29URRjH+w34CHwEX2hiTIw10ZiYYHhlIomRGAxGrsotgphGExIihRWqQBEtKEuLVJaLwUC7tN1CaaGyvdBSWqBg2lBAWlIMTS9wnP+mpzl79nnmzJyd2QvhJE8su+fMmfnN/7nMnLOWlOTomJmZWfj06dOyZ8+excR/GxyFA+fNnl+G60uK+RgdHZ0nBrFYdfCqB9pDu2i/KEBMTEzMF52OiJkdcyweaF/cpwr3K1gQkLeThwOqKRgwkK7o0GrbilBUTCSvrjQ5OfmS8OdBlQ6L88Yxk8Iqxd9Lp6enF0xNTb3MGb7HeeL8cmEnxYCHFe8zKK4tzTkMBDYVVcwGwaWywasaIAEO4CrcN5IzGEiDCmqIBqkgCzClsyl8OMCNYtZdCJE9SBEyEO13by6ovt5WVtndFN3ZGW/nDN8fuNZSHv/n2qIAMOUyxYjvktagyJSBTnGuMTj2oHR/T3Pl9mTd8LbkWUfXcB0AcXAwAUIN7bJJshIzJNLsw2xRIHZ3NZ7c9veZ8TAgKKvojDdwYGQTBmUbLbslNzpJwYBbmAThNygOwP33hUo5FzISaJFauWwCGKwqLEAoT9Y5Ozrq56yi61xfx4OhBQSURRwUKD3b9UhS1U0AI9JR32caBAa/+2qjs6+3OcN+6m1+nLx/e7noy+sq7oPJxSQbzShczIB/m4axq+scCcJrP/c0j4w8fvSB6NPboh+vBEEJlXkwYC6bUDBsuIkKDNeqes/fnIXyjk8pUcbdy3QD6SADJCPCIyWahvF9Z1wZhmuH+tsuCiDvCXvL2z8omhqL8oKQS7FYh/hh1A5cWWMaxvaOOm0Yrv052LUPUETfXvOti8ZDp2JKHSh8qIwSttiSGRdAVQxBdtZ13vW5TnkolWApz7jK0ly4ClJrWBiu1fRfqp9Vyas+1xmm1jvG1GGj1tjZFc8aCGxgbGSJgPKGSipmVYL8rBpIUSnaAKKTWWR29Eb7CQHkTX+/KZXAKzh3iVA1B7VusBE7TAJBLKGAULEEdYmyu6ABf6NYXNlao5hyGVjjUN8yamWs5Dao3KgTqb0N7FPYApJNyvXbwWstlZS6qbok47kPtaLl3MVGie61vT1NWcOo7Ek42GhitgmigSthKgLjQqpBGwu4bKtUvyEWIc5R/ReTvyZwE4l6wgZIVIM2Ybi252p4lUBhbjvcDhsVHgKBcFuCuQASFgpcBXFIBgQWCIQJqKX5BAL7obtBGQYA+q/ngFCBNe15DgWEayyXQNxULAu0UEVFVwN5rQRIe9ECcS3SWZ8Kll5DAJZd81wDCWMvgLwAYgkI9aiBWuU+R0AyVr1pu/G5qEO2Xj7trD1V5Xwa3TVny2p+dMqaarXa2dJ6yllZuzetHfwbn6sCCVWYUSvdbICg4x/u2UKaKhRA/WjfVrINfI7vg4CoVqplKk/mwgKBMjgY3GB0ocLwfRAQpbWMzmo3jKvIBuHa57H90nY2x48otYPzZECUVrvYIFHdD9EFAndQGYh/dnVV5hrOkwFh9kMWh94xK2YgyjtmOnuqxewyWnuqqrvuYYIqBhsUVKm06bdPDu6QtoPvZUFVa9dd9blM2LTLSR6D+Pb8cWW1oXah2sHnsrSr/VxG9h6Zt0jLpnKEnNFxt6CCclTSrd82nP41rTDDv4MqVUYdDYEvyVBlvFclxVi6cxOt9JIvd7GbcYoNiOTpf4Pyq1TMYg+vXhp9SIXYgYCqWrq75288e1gZCPcTFa1XwLm3AJCGsVNlCgh8X6d0d7OMt9aQGfcaROBTfwYKSbb/0T1jQADh41+2zWUbTilQhptdVOHVDFxmfzkR6u3m2d/AkK9kdj8cNgYF9Ye3vsDAoQDXvGkWMFRS9IG+FmdiZop763qhlZd2oRQb7hO2knUtdivJwjDy8i4XT3DcezJuFApcAQHTqxD8W7VWOX2nW/rriKxhvF9XOW9Fc3VZ28gtRwYFz0bymV4xKXBjq7+KAIhVieqx1eePOLDG4evSH+3Eh/ryAgPxApPCHQPCtTe1xmKY3NCqWNlU3eCC8Fq0v00KBXEll2q5cPeGtD9Qttv3FYnqwRXnftN7rRsXeFURBgqO9vu3rYGBe0CNXOCkYHhtedPhxcrKWNVUnZTBcG1/b7Mz9Hg0EAwUg3rAlGsgTgSBeDI9meof13dMuJJSODfh7MuLx5yuf4eUfkaKQQAOZlYVEM5D1gCER5NPlO6DePFd8kxg3wFFGlMQQHVg+F0Is5Lv49jNK1r9hgB4V2HiBlwIPvdZ4nApDH9zaoHP5gMM7ov7U/1alogulCkfY8p0lUR1FUlQfE4BlFH/5vKpVHq2DQbtAwTuJ+vPnAc0RVdT3yPzZAyQUgcrpwAgfleSFXRh1YB2OUVwQGRhIS3Aci5ASkkTiNcqRKr8687VVBB+OPGf0uBxHs7Hdbje3+b6llpnw8U/Uoa/g4BwoSHNEyh3QdyQZaOwwdekrRMAvr50Is3WEVAIb4hI3YYKOPC3Qgeyue14BhB8FgQE7iFVEgVE5i6FAsQPw7UgIFz/02KI169kwbSQgGxsjWXAwGcqQPzBNaOUXxI/NB8nBblKIQFJ1T6tx+Zg4O+goOp3HYwXdUrWeySFAkQ37Vo7EJVtdB7pE7J3be2Fo1m1RxZdNg6usjUlf699ceH3tPMAyf0OAKVrFabSNn4gC5mEsZ6oKbhU6g+mfmA62dKsSjS3CnQzhtfWeFzHX39wQFSypdEDmSloZ80GEABwoaxjynXlDSDjwVVhu9G0yygFU1FC5O3/ZZbK5wayziZGJZwKgkx539TGIdul1027LoivhDJkAbPgoZjOPKYsL7Ek2z1Zq0CEO4d+QJXNQe0zFAyUfARZlcCKjLQyURNTjTfYqML5WITBJbEQA/gwmS2nKuE2XWyW0giYOtlNdSWf07WN6VLafTNBbTJqYgWVXWyW0ip9yEkpr/Ms2MhGjORA+3kFogMjVwst7mGU9a0AHRjICFgI5qpi5vplrWpNBTKN6G7bVajsQ/XD2qTolOj5Wkv46xT77hJQGEFBOd2tIlTi9hHp1npRRi35vVVlSREf/wOp5s3KqNhgtwAAAC10RVh0U29mdHdhcmUAYnkuYmxvb2RkeS5jcnlwdG8uaW1hZ2UuUE5HMjRFbmNvZGVyqAZ/7gAAAABJRU5ErkJggg==",
    "player-walk-2": "data:image/png;base64,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",
    "bee-fly-1": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAAwCAYAAABE1blzAAAEgUlEQVR42tWaT2gTQRTG56IHUSJ48pSbIAg5CHrwkINFL0Jp6T9PoX8PogS8iF4CiiBFCB4UPO1BxR7EQEDRqsSDhbZGg4g1TQ0LKiVSbNAaa22Scb7arZvN7GR3djaJAx+EbfvY375v3nuzKSEO1tzcXJApDM3Pz4dIi9ba2lpofX09DC0vLweUBAVUNpvVFxYWqCEGmUin04Fmga2urgYrlUqKWhZAvYAFAWIGM4tBa82AQ6aq1WqRchauI6uugzKwWC6XK9rBGUJ2/YYrl8sZKliuIHl2FIk9iFQr4RxDNrKjSOyBdLYSriEkqqITOwoA9VbDCSEZYFwWzmTVWKvhbCFVAMIBXtuGCjguJG7Mi0VVtA2VcCbIRE1b8Aq4adVQO8DVASKL7OYyCgBT7QDHnXLQKtxaVZ9P0c/vb9do6c2p2PosCRtanSLBZsMVCgU87IirlpHPvaKFd1foz8whWk7vojRNHKs8S/TKSxIrT5NOP+FYTLq4uChuX2jcVrivb8+4hrJVJkCrPz8UVcOtrKzQfD5v3TIRu1k0Yljw1+v9asA24Wgp41vWXPXnfPZ5XFnWDC1pvmfNUQaXn5AA2zcZpXDQ95TvWTPBxW2zV5klmnI4aKHT16yh1cGW6Ai2cCjtvsAZ0iNKswYoVhijQqia7M2QlK+AEpDWrKEFwIKuJyc0Zd/hXEBa+5oUlGXvRZsF+PHRHqppmjBr+ofMxnCBVsWcFfd8HvOtuHCkXQ3TsbGxDchSqbQFhs+Tk5N0fHycJm8erPkb1AdvgIL993uaUD1JaO7+X+EzrskCRk9HNgChaDRKk8kknZiY+HeN/bw0tb1u5PMNMH2L0IfXaoVrMnCZe8EtEDtZs7cFOUMiygE/PaiHM/TtuXvA65ePCeHOnz0pHNylAasvSYIXdFqzB4Rd3RaXRtlDhkUxpPcijjR+AxrFxU7IbqMY0hV1bYaEeAFRUFRYdCm1UwjHKyx+2LTIC/rmbj0crqnM3tSdfY5tLl9obGwKFR7/axP4rHLvAd5NnKGhIfmJBhZQ3divxk7Ywl083+0oRja5d+tvBgcH5b8yuBA9qhQQ1vO676wxRkZG5N6m9/X1xQYGBuiNS4eVwOHmzVOLFQ6Wk3lAUoDd3d1BBlgEIHTuzHH648U2T4C340dS7GbiPEAncE+1A9yHIwXY29sbNuDMkPrD3a7BUI1xOtmMG2A3VHRbMUVVVwqwq6srZAU0BMt+ntylOwTT8F7HHHt4eFhTBYeC9eXZDrk92NPT09nf369bAXHNOBRj4EU7sQqDgl1cBhhxMoZhz6KqNpp0jJfIUqujoyPAbBU34LAvkV0vJxXYtNGeQxvAoO2kV3o+GxqWxb5E8VHxBafdlOSklaDYmH+ftOPiHcdgSdHxCXDIrGWfJ9oT0PLOB8N3o/3GGwI8HXp9/Y8lVqAMm8JyogHArhh5fm3h90J5F82lKCTIrO1RyUv1bNYaHR1N8HpboyrbttbkLUwiBpi1iPBs+V9kjvctFvoZig8qbJ3YROQV7A+WXxR4tj+uXQAAAC10RVh0U29mdHdhcmUAYnkuYmxvb2RkeS5jcnlwdG8uaW1hZ2UuUE5HMjRFbmNvZGVyqAZ/7gAAAABJRU5ErkJggg==",
    "bee-fly-2": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD0AAAAqCAYAAAAAsVPKAAAEW0lEQVR42t2aS2gTQRjH56IHsUTw5Ck3QRBy04OHHCyKIJSWvjyFPk+WgBQkXiKKIKUQPKTXPVjRgxgoWKwP0oOBPqKxSGObIqFtkEhIloK21iQd5x+7cbPdxySdbEw/+NNlSTfz2/meuyFEx6LRqGNlZcW7urrqh9hxGznqxkBja2trVC0GnozH484jCczA3FpgRYlEQsbOwxP+t3Xn83l3sVj07+3tyVRl7Fw4l8s5rHY5bASt3nX2OU8jIXd3d10MyAsoamH4jBmwxwpYLdwgeIadkGwnQ9rd5DFilLzgvtVAq3ZeEh3vOzs7zsNAag3ur7fL/lqA1fG+ufzYn18gbjPtRIjTCLJQKHgYqMT+JqlgQ7xrk5ezWsiviQ80vfyQbscu0EK0hdIo4VZhgSSLi8RfmCOlUri/ozKtox2Ia57kpVb280jVoIba8FK7jKtEaZVcDdNfH8+JgW0AdDmuUX543VnY7qq17LINuhzXvMDCd1itvGwXdJg7nreWOuoHDMkhe+Ma9dkMPPVlsr7ANsc1K4dtFWULTYa2QUFJqjt0I+Jarx1lCiFb1x3Y5rjW7czUVlwgXtugM1JdYdH8oAmy7H8ZtGQX9LPgNZrJZGqJUbq9vV2WLMs0m82WlUql6Pr6emk44mr6i/MkbLTI33OEJqcITbz4KxzjXK3Q3pse6vP5aDAYpDMzMzQWi5UXnk6nS4tXVMtsIAQ6+pjQ6UeVwrlagGPPnXR4eFhXo6OjdGxsjH6avVuqJOgZGgK9+fIgsKKt2eqhgw+uGEJDvls3KgcW1hmiqmAG+BafoDxdJaZILui9RRLSW+ScZAwNV68GeOPVaVNgCJ5gdg2MrMocgQeaKL3YWZUC3IM8xr96Q0vjblNgeIHVNZhHBsQ9opknLr0vQdIS4d6Z8ElTYCS3n5HjXPO50GdTzMVlvS9aenoQGOdE7nLkyVnuEBEKbeTiUHrmX8nCschYxg2p5jr9/f0uoeBwH9HNyLj/uiHwPR/fVLcydab8P319fWLfwtzxXhYKDbc9bBxrrzE4OOgXBtzd3e3v7e2lE/cvCgEGEMCMgOGutdw0YdAdHR1OBi0DGro9cpX+eH/sUNCTgUthtsCAHjQP8FvpvO4NEwbd1dXlVoDV4MnpU1XDogpgatu/roMtUq42U5tle2HQ7e3tLi20Irh76nVLkhNWyr0hFS/RBgYGJFHASIrf350QF9OdnZ1tPT09SS00zpXeTESIszBPPChtWqG5Mboug/bwtJjIAcjmVh2b8uJAmLW2tjqYSwYUYMQ5vOCQoeOwimGUJAwbPLVc6b+FG0AR50hw9ez2eMoaEpr6803zAwC90RXubDZqAhgeoMkboeaB1jyDwwBiFb96jQtyStNAIwkqLg53NWtajBKe8AnLDkOpMevDkazgAYZjpeisbZcNDQ2F9GqvVXZvKrfWM3RUCqw2Uem5dNPusNbQtaHeIsEhsx8Q6+xEwP4BNeE5kBl9/loAAAAtdEVYdFNvZnR3YXJlAGJ5LmJsb29kZHkuY3J5cHRvLmltYWdlLlBORzI0RW5jb2RlcqgGf+4AAAAASUVORK5CYII="
  },
  stage: {
    width: 1920,
    height: 1080
  },
  gameObjects: [
    {
      id: "player",
      visible: true,
      x: 660,
      y: 540,
      layer: 0,
      rotation: 0,
      width: 250,
      height: 250,
      sprites: [
        "player-walk-1",
        "player-walk-2"
      ],
      activeSprite: 0,
      code: 
`while (true) {
  that.activeSprite = (that.activeSprite + 1) % that.sprites.length;
  await sleep(250);

  deltaTime = await tick();
}`
    },
    {
      id: "bee",
      visible: true,
      x: 1260,
      y: 540,
      layer: 1,
      rotation: 0,
      width: 250,
      height: 250,
      sprites: [
        "bee-fly-1",
        "bee-fly-2"
      ],
      activeSprite: 0,
      code: 
`while (true) {
  that.rotation -= 90 * deltaTime;

  deltaTime = await tick();
}`
    }
  ]
}

export default project