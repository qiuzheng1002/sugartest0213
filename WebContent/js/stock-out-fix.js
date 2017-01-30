// ID取得
var id = parseInt($.url().param('id'));
$("input[name=id]").val(id);

// 受注・出庫データ読み込み
var rows = alasql('SELECT * FROM trans WHERE id = ?', [ id ])[0];
$("#selected_date1").attr("value", rows.trans.date);
$("#selected_shop1").attr("value", rows.trans.shop);
$("#selected_num1").attr("value", rows.trans.num);
$("#selected_deadline1").attr("value", rows.trans.deadline);
var state_check = rows.trans.state;
if (state_check == 4){
	$('<label class="btn btn-danger active" id="btn_state4"><input type="radio" autocomplete="off" checked> 受注済み</label>').appendTo("#selected_state");
	$('<label class="btn btn-default" id="btn_state5"><input type="radio" autocomplete="off"> 納期確定済み</label>').appendTo("#selected_state");
	$('<label class="btn btn-default" id="btn_state6"><input type="radio" autocomplete="off"> 出庫済み</label>').appendTo("#selected_state");
}
else if (state_check == 5){
	$('<label class="btn btn-default" id="btn_state4"><input type="radio" autocomplete="off"> 受注済み</label>').appendTo("#selected_state");
	$('<label class="btn btn-warning active" id="btn_state5"><input type="radio" autocomplete="off" checked> 納期確定済み</label>').appendTo("#selected_state");
	$('<label class="btn btn-default" id="btn_state6"><input type="radio" autocomplete="off"> 出庫済み</label>').appendTo("#selected_state");
}
else if (state_check == 6){
	$('<label class="btn btn-default" id="btn_state4"><input type="radio" autocomplete="off"> 受注済み</label>').appendTo("#selected_state");
	$('<label class="btn btn-default" id="btn_state5"><input type="radio" autocomplete="off"> 納期確定済み</label>').appendTo("#selected_state");
	$('<label class="btn btn-success active" id="btn_state6"><input type="radio" autocomplete="off" checked> 出庫済み</label>').appendTo("#selected_state");
}

//ラジオボタンクリック(受注済み)
$(function(){
	$(document).on("click","#btn_state4",function() {
	$('#selected_state').empty();
	$('<label class="btn btn-danger active" id="btn_state4"><input type="radio" autocomplete="off" checked> 受注済み</label>').appendTo("#selected_state");
	$('<label class="btn btn-default" id="btn_state5"><input type="radio" autocomplete="off"> 納期確定済み</label>').appendTo("#selected_state");
	$('<label class="btn btn-default" id="btn_state6"><input type="radio" autocomplete="off"> 出庫済み</label>').appendTo("#selected_state");
	});
});

//ラジオボタンクリック(納期確定済み)
$(function(){
	$(document).on("click","#btn_state5",function() {
	$('#selected_state').empty();
	$('<label class="btn btn-default" id="btn_state4"><input type="radio" autocomplete="off"> 受注済み</label>').appendTo("#selected_state");
	$('<label class="btn btn-warning active" id="btn_state5"><input type="radio" autocomplete="off" checked> 納期確定済み</label>').appendTo("#selected_state");
	$('<label class="btn btn-default" id="btn_state6"><input type="radio" autocomplete="off"> 出庫済み</label>').appendTo("#selected_state");
	});
});

//ラジオボタンクリック(出庫済み)
$(function(){
	$(document).on("click","#btn_state6",function() {
	$('#selected_state').empty();
	$('<label class="btn btn-default" id="btn_state4"><input type="radio" autocomplete="off"> 受注済み</label>').appendTo("#selected_state");
	$('<label class="btn btn-default" id="btn_state5"><input type="radio" autocomplete="off"> 納期確定済み</label>').appendTo("#selected_state");
	$('<label class="btn btn-success active" id="btn_state6"><input type="radio" autocomplete="off" checked> 出庫済み</label>').appendTo("#selected_state");
	});
});


//パンくずリストdetail + shop追加
var bread_rows = alasql('SELECT * FROM trans \
		JOIN stock ON stock.id = trans.stock \
		JOIN whouse ON whouse.id = stock.whouse \
		JOIN item ON item.id = stock.item \
		WHERE trans.id = ?', [ id ])[0];
$('#this_bread_detail').append("<a href='stock-out.html?id=" + bread_rows.trans.stock + "'>[倉庫] " + bread_rows.whouse.name + "　[品番] " + bread_rows.item.maker + " : " + bread_rows.item.detail + "</a>");
$('#this_bread_shop').append("受注データ編集 (" + bread_rows.trans.shop + ")");

// 取引先入力補助
var shop_rows = alasql('SELECT DISTINCT shop FROM trans');
for (var i = 0; i < shop_rows.length; i++) {
	var shop_row = shop_rows[i];
	$('<option value = "' + shop_row.shop + '">').appendTo('#shops');
}