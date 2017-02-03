// ID取得
var id = parseInt($.url().param('id'));
$("input[name=id]").val(id);

//データ事前入力
if (isNaN(id) == true){
	$("#this_bread").text("NewData"); //パンくずリスト
	var kind_id = alasql('SELECT MAX(id) + 1 as id FROM kind')[0].id;
	$("#kind_data_id_input").attr("value", kind_id); //data No.
}
else{
	var kind_object = alasql('SELECT * FROM kind WHERE id = ?', [ id ])[0];
	var kind = $(kind_object).attr("kind"); //object皮むき
	$("#this_bread").text("Data No. " + kind.id + " - " + kind.text); //パンくずリスト
	$("#kind_data_id_input").attr("value", kind.id); //data No.
	$("#kind_data_text_input").attr("value", kind.text); //商品区分
}

//履歴データ編集
$(function(){
	$(document).on("click","#update_kind",function() {
		if (isNaN(id) == true){
			var kind_id = alasql('SELECT MAX(id) + 1 as id FROM kind')[0].id;
			var kind_text = $('#kind_data_text_input').attr("value");
			//既存のデータと重複チェック
			alasql('INSERT INTO kind VALUES(?,?)', [ kind_id, kind_text ]);			
		}
		else{
			var kind_id = id;
			var kind_text = $('#kind_data_text_input').attr("value");
			alasql("UPDATE kind SET text = '" + kind_text + "' WHERE id = " + kind_id);
		}
		window.location.assign('index-kind-info.html');
	});
});

//ツールチップ
$(function () {
	$('[data-toggle="tooltip"]').tooltip();
});