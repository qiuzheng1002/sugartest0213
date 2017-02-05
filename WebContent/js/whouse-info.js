// ID取得
var id = parseInt($.url().param('id'));
$("input[name=id]").val(id);

//データ事前入力
if (isNaN(id) == true){
	$("#this_bread").text("NewData"); //パンくずリスト
	var whouse_id = alasql('SELECT MAX(id) + 1 as id FROM whouse')[0].id;
	$("#whouse_data_id_input").attr("value", whouse_id); //data No.
	//削除ボタン非表示
	$("#delete_whouse").css("display","none");
}
else{
	var whouse_object = alasql('SELECT * FROM whouse WHERE id = ?', [ id ])[0];
	var whouse = $(whouse_object).attr("whouse"); //object皮むき
	$("#this_bread").text("Data No. " + whouse.id + " - " + whouse.name); //パンくずリスト
	$("#whouse_data_id_input").attr("value", whouse.id); //data No.
	$("#whouse_data_text_input").attr("value", whouse.name); //倉庫名
	$("#whouse_data_addr_input").attr("value", whouse.addr); //住所
	$("#whouse_data_tel_input").attr("value", whouse.tel); //電話番号
	var using_whouse_inStock = alasql('SELECT * FROM stock WHERE whouse = ?', [ id ]); //stockCSVの中で使用中かチェック
	var using_whouse_inStock_num = using_whouse_inStock.length; //使用中の個数
	if (using_whouse_inStock_num != 0){ //使用中の場合、削除ボタン無効
		$("#delete_whouse").replaceWith('<button type="submit" class="btn btn-danger btn-xs" id="delete_whouse_not" data-toggle="tooltip" data-placement="top" title="在庫データに使用中のため削除不可"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span> 削除</button>');
	}
}

//データ保存
$(function(){
	$(document).on("click","#update_whouse",function() {
	//倉庫名10文字以内チェック
		var whouse_text_check = 0;
		var whouse_text = $('input[name="whouse_data_text_name"]').val();
		var whouse_text_num = whouse_text.split(/[\uD800-\udbff][\uDC00-\uDFFF]/g).length - 1; //サロゲートペアチェック
		var whouse_text_length = whouse_text.length - whouse_text_num;
		if (whouse_text_length == 0 || whouse_text_length > 10){ //0文字 or 11文字以上の場合アウト		
			$("#whouse_data_text").css("color","red");
			$("#whouse_data_text_span").css("color","red");
			$("#whouse_data_text_span").animate({opacity: 0.4},50);
			$("#whouse_data_text_span").animate({opacity: 1.0},50);
			$("#whouse_data_text_span").animate({opacity: 0.4},50);
			$("#whouse_data_text_span").animate({opacity: 1.0},50);
			whouse_text_check = 0;
		}
		else{
			$("#whouse_data_text").css("color","black");
			$("#whouse_data_text_span").css("color","black");
			whouse_text_check = 1;
		}
	//住所30文字以内チェック
		var whouse_addr_check = 0;
		var whouse_addr = $('input[name="whouse_data_addr_name"]').val();
		var whouse_addr_num = whouse_addr.split(/[\uD800-\udbff][\uDC00-\uDFFF]/g).length - 1; //サロゲートペアチェック
		var whouse_addr_length = whouse_addr.length - whouse_addr_num;
		if (whouse_addr_length == 0 || whouse_addr_length > 30){ //0文字 or 31文字以上の場合アウト		
			$("#whouse_data_addr").css("color","red");
			$("#whouse_data_addr_span").css("color","red");
			$("#whouse_data_addr_span").animate({opacity: 0.4},50);
			$("#whouse_data_addr_span").animate({opacity: 1.0},50);
			$("#whouse_data_addr_span").animate({opacity: 0.4},50);
			$("#whouse_data_addr_span").animate({opacity: 1.0},50);
			whouse_addr_check = 0;
		}
		else{
			$("#whouse_data_addr").css("color","black");
			$("#whouse_data_addr_span").css("color","black");
			whouse_addr_check = 1;
		}
	//電話番号15文字以内チェック
		var whouse_tel_check = 0;
		var whouse_tel = $('input[name="whouse_data_tel_name"]').val();
		var whouse_tel_num = whouse_tel.split(/[\uD800-\udbff][\uDC00-\uDFFF]/g).length - 1; //サロゲートペアチェック
		var whouse_tel_length = whouse_tel.length - whouse_tel_num;
		if (whouse_tel_length == 0 || whouse_tel_length > 15){ //0文字 or 16文字以上の場合アウト		
			$("#whouse_data_tel").css("color","red");
			$("#whouse_data_tel_span").css("color","red");
			$("#whouse_data_tel_span").animate({opacity: 0.4},50);
			$("#whouse_data_tel_span").animate({opacity: 1.0},50);
			$("#whouse_data_tel_span").animate({opacity: 0.4},50);
			$("#whouse_data_tel_span").animate({opacity: 1.0},50);
			whouse_tel_check = 0;
		}
		else{
			$("#whouse_data_tel").css("color","black");
			$("#whouse_data_tel_span").css("color","black");
			whouse_tel_check = 1;
		}
		
	//既存のデータと重複チェック
		if (whouse_text_check == 1 && whouse_addr_check == 1 && whouse_tel_check == 1){
			if (isNaN(id) == true){
				var whouse_id = alasql('SELECT MAX(id) + 1 as id FROM whouse')[0].id;
				alasql('INSERT INTO whouse VALUES(?,?,?,?)', [ whouse_id, whouse_text, whouse_addr, whouse_tel ]);
			}
			else{
				var whouse_id = id;
				alasql("UPDATE whouse SET name = '" + whouse_text + "', addr = '" + whouse_addr + "', tel = '" + whouse_tel + "' WHERE id = " + whouse_id);
			}
		window.location.assign('index-whouse-info.html');
		}
	});
});

//登録データ削除
$(function(){ //SQL内のデータを削除し、結果的にテーブルから削除
	$(document).on("click","#delete_whouse",function() {
		alasql('DELETE FROM whouse WHERE id = ' + id)[0]; //idを用いてデータを削除する
		window.location.assign('index-whouse-info.html');
	});
});

//ツールチップ
$(function () {
	$('[data-toggle="tooltip"]').tooltip();
});