// ID取得
var id = parseInt($.url().param('id'));
$("input[name=id]").val(id);

//データ事前入力
if (isNaN(id) == true){
	$("#this_bread").text("NewData"); //パンくずリスト
	var kind_id = alasql('SELECT MAX(id) + 1 as id FROM kind')[0].id;
	$("#kind_data_id_input").attr("value", kind_id); //data No.
	//削除ボタン非表示
	$("#delete_kind").css("display","none");
}
else{
	var kind_object = alasql('SELECT * FROM kind WHERE id = ?', [ id ])[0];
	var kind = $(kind_object).attr("kind"); //object皮むき
	$("#this_bread").text("Data No. " + kind.id + " - " + kind.text); //パンくずリスト
	$("#kind_data_id_input").attr("value", kind.id); //data No.
	$("#kind_data_text_input").attr("value", kind.text); //商品区分
	var using_kind_inItem = alasql('SELECT * FROM item WHERE kind = ?', [ id ]); //itemCSVの中で使用中かチェック
	var using_kind_inItem_num = using_kind_inItem.length; //使用中の個数
	if (using_kind_inItem_num != 0){
		$("#delete_kind").replaceWith('<button type="submit" class="btn btn-danger btn-xs" id="delete_kind_not" data-toggle="tooltip" data-placement="top" title="商品データに使用中のため削除不可"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span> 削除</button>');
	}
}

//履歴データ編集
$(function(){
	$(document).on("click","#update_kind",function() {
		var kind_text = $('input[name="kind_data_text_name"]').val();
		var kind_text_num = kind_text.split(/[\uD800-\udbff][\uDC00-\uDFFF]/g).length - 1; //サロゲートペアチェック
		var kind_text_length = kind_text.length - kind_text_num;
		if (kind_text_length == 0 || kind_text_length > 10){ //0文字 or 11文字以上の場合アウト		
			$("#kind_data_text").css("color","red");
			$("#kind_data_text_span").css("color","red");
			$("#kind_data_text_span").animate({opacity: 0.4},50);
			$("#kind_data_text_span").animate({opacity: 1.0},50);
			$("#kind_data_text_span").animate({opacity: 0.4},50);
			$("#kind_data_text_span").animate({opacity: 1.0},50);
		}
		else{
			$("#kind_data_text").css("color","black");
			$("#kind_data_text_span").css("color","black");
			//既存のデータと重複チェック
			if (isNaN(id) == true){
				var kind_id = alasql('SELECT MAX(id) + 1 as id FROM kind')[0].id;
				alasql('INSERT INTO kind VALUES(?,?)', [ kind_id, kind_text ]);
			}
			else{
				var kind_id = id;
				alasql("UPDATE kind SET text = '" + kind_text + "' WHERE id = " + kind_id);
			}
		window.location.assign('index-kind-info.html');
		}
	});
});

//登録データ削除
$(function(){ //SQL内のデータを削除し、結果的にテーブルから削除
	$(document).on("click","#delete_kind",function() {
		alasql('DELETE FROM kind WHERE id = ' + id)[0]; //idを用いてデータを削除する
		window.location.assign('index-kind-info.html');
	});
});

//ツールチップ
$(function () {
	$('[data-toggle="tooltip"]').tooltip();
});

//タブhover
$(function(){
	$("ul.dropdown-menu").hide();
	$("li.dropdown").hover(function(){
		$("ul:not(:animated)",this).slideDown("fast");
	},
	function(){
		$("ul",this).slideUp("fast");
	});
});