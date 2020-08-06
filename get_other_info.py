import googlemaps
import random
from pprint import pprint

# 各々のAPIKeyを使用する
path = '../apikey.txt'
f = open(path)

API_KEY = f.read()
CLIENT = googlemaps.Client(API_KEY)


def create_text(place_result):
    text = ''
    # TODO
    # スポットを参照して台詞を選択
    if '山口大学' in place_result:
        text += '山大だね! 山大生ってホントにイケメンが多いよね!'
    elif place_result == 'ラーメン祐三':
        text += 'ラーメン祐三がある! このアプリを作成したメンバーは祐三が大好きみたいだよ!'
    elif "McDonald's" in place_result:
        cand = ['マックここにもあるじゃん! ちなみにマクドと、マックどっち派？',
                'マックあるね！ドナルドは31の言語を喋れるらしい・・・',
                '知ってた？アメリカのマックはドリンクのSサイズが日本のLサイズくらいあるらしいよ']
        i = random.randint(0, len(cand)-1)
        text += cand[i]
    elif 'Lawson' in place_result:
        cand = ['ローソンあるね、トイレとか大丈夫？',
                'あっ，ローソン！ pontaはポイントターミナルの略って知ってた？',
                'ローソンだね．Lチキの旨塩は間違いないね！']
        i = random.randint(0, len(cand)-1)
        text += cand[i]
    elif '7-Eleven' in place_result:
        cand = ['セブンが見えるね! ちなみに, 私が好きなセブンイレブンの商品はシャキシャキレタスサンドだよ!',
                'セブン前を通過したよ! セブンイレブンの売上1位の商品は,「旨みスープの野菜盛りタンメン」らしいよ!']
        i = random.randint(0, len(cand)-1)
        text += cand[i]
    elif 'Aruk' in place_result:
        # アルクが見えた時
        pass
    elif 'Suwa' in place_result:
        text = 'Suwa'
    else:
        # TODO
        # 適当なこと話す
        text += 'else'
    return text


def get_around_spot(latitude, longitude):
    loc = {'lat': latitude, 'lng': longitude}
    place_result = CLIENT.places_nearby(
        location=loc, radius=400)
    store_list = []
    for store in place_result['results']:
        store_list.append(store['name'])
    print(store_list)

    text = create_text(store_list)
    return text
