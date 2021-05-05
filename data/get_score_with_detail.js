javascript:
if (typeof is_getdata != "undefined") {
    alert("データ取得済みです。");
    throw Error("Error: データ取得済み");
} else {
    let make_csv = {
        save: function (data, filename) {
            this.check_data(data);
            console.info('filename:', filename);
            const csv_str = this.to_string(data);
            const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
            const blob = new Blob([bom, csv_str], { 'type': 'text/csv' });
            const url = window.URL || window.webkitURL;
            const blobURL = url.createObjectURL(blob);
            let a = document.createElement('a');
            a.download = decodeURI(filename);
            a.href = blobURL;
            a.type = 'text/csv';
            a.click();
        },
        check_data: function (data) {
            if (data.length == 0)
                throw Error('Error: 参照データが存在しません。');
            if (!this.is_array(data) || !this.is_object(data[0]))
                throw Error('Error: スコアが正常に取得できていません。');
        },
        to_string: function (data) {
            const keys = Object.keys(data[0]);
            const array_data = data.map((record) => (keys.map((key) => record[key])));
            let csv_str = [].concat([keys], array_data);
            console.log(csv_str);
            return csv_str.map((record) => (
                record.map((field) => (this.prepare(field))).join(',')
            )).join('\n');
        },
        prepare: function (field) {
            return '"' + ('' + field).replace(/"/g, '""') + '"';
        },
        is_object: function (obj) {
            return '[object Object]' === Object.prototype.toString.call(obj);
        },
        is_array: function (obj) {
            return '[object Array]' === Object.prototype.toString.call(obj);
        },
    };

    let make_table = {
        make: function () {
            let all_music_data = [];
            for (let i = 1; i <= 999; i++) {
                const data = this.extract(i);
                if (data != null)
                    all_music_data.push(data);
            }
            return all_music_data;
        },
        get_data: function (music_id) {
            const xmlHttp = new XMLHttpRequest();
            xmlHttp.open("GET", "https://mypage.groovecoaster.jp/sp/json/music_detail.php?music_id=" + music_id, false);
            xmlHttp.send(null);
            return JSON.parse(xmlHttp.responseText);
        },
        status: function (result_data) {
            if (result_data.perfect > 0)
                return "PERFECT";
            if (result_data.full_chain > 0)
                return "FULL CHAIN";
            if (result_data.no_miss > 0)
                return "NO MISS";
            if (result_data.failed_mark != false)
                return "CLEAR";
            return "FAILED";
        },
        extract: function (music_id) {
            const music_data = (this.get_data(music_id)).music_detail;
            let song_data = {
                music_id: music_id,
                song_title: " ", song_artist: " ", favorite: " ", genre: " ",
                dif_simple: " ", score_simple: " ", rate_simple: " ", count_simple: " ", status_simple: " ",
                dif_normal: " ", score_normal: " ", rate_normal: " ", count_normal: " ", status_normal: " ",
                dif_hard: " ", score_hard: " ", rate_hard: " ", count_hard: " ", status_hard: " ",
                dif_extra: " ", score_extra: " ", rate_extra: " ", count_extra: " ", status_extra: " "
            };
            if (music_data == null) { return null; }
            song_data.song_title = music_data.music_title;
            song_data.song_artist = music_data.artist;
            song_data.favorite = (music_data.fav_flg == 0) ? " " : "o";
            if (music_data.simple_result_data != null) {
                song_data.score_simple = music_data.simple_result_data.score;
                song_data.rate_simple = music_data.simple_result_data.rating;
                song_data.count_simple = music_data.simple_result_data.play_count;
                song_data.status_simple = this.status(music_data.simple_result_data);
            }
            if (music_data.normal_result_data != null) {
                song_data.score_normal = music_data.normal_result_data.score;
                song_data.rate_normal = music_data.normal_result_data.rating;
                song_data.count_normal = music_data.normal_result_data.play_count;
                song_data.status_normal = this.status(music_data.normal_result_data);
            }
            if (music_data.hard_result_data != null) {
                song_data.score_hard = music_data.hard_result_data.score;
                song_data.rate_hard = music_data.hard_result_data.rating;
                song_data.count_hard = music_data.hard_result_data.play_count;
                song_data.status_hard = this.status(music_data.hard_result_data);
            }
            if (music_data.extra_result_data != null) {
                song_data.score_extra = music_data.extra_result_data.score;
                song_data.rate_extra = music_data.extra_result_data.rating;
                song_data.count_extra = music_data.extra_result_data.play_count;
                song_data.status_extra = this.status(music_data.extra_result_data);
            }
            return song_data;
        },
    };

    let set_details = {
        set: function (data) {
            let details = this.get_info();
            for (let i = 0; i < data.length; i++) {
                const id = data[i].music_id;
                data[i].genre = details[id][2];
                data[i].dif_simple = details[id][3];
                data[i].dif_normal = details[id][4];
                data[i].dif_hard = details[id][5];
                if (details[id][6] != "")
                    data[i].dif_extra = details[id][6];
            }
        },
        get_info: function () {
            let req = new XMLHttpRequest();
            req.open("get", "https://raw.githubusercontent.com/Kanagu-Requiem/test/master/data/Groove_Coaster_Info.csv", false);
            req.send(null);
            return req.responseText.split("\r\n").map((record) => (record.split(",")));
        },
    };

    function get_date() {
        let req = new XMLHttpRequest();
        req.open("get", "https://raw.githubusercontent.com/Kanagu-Requiem/test/master/data/update_date.txt", false);
        req.send(null);
        return req.responseText;
    }

    is_getdata = 1;
    alert("データ集計を開始します。\n時間がかかる場合があります。\n気長にお待ちください。\n\nジャンル・難易度は" + get_date() + "新曲追加分まで対応しています。");
    let all_music_data = make_table.make();
    set_details.set(all_music_data);
    make_csv.save(all_music_data, "Groove_Coaster_score.csv");
}
