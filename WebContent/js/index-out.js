// 検索ボックス作成
var rows = alasql('SELECT * FROM whouse;');
for (var i = 0; i < rows.length; i++) {
	var row = rows[i];
	var option = $('<option>');
	option.attr('value', row.whouse.id);
	option.text(row.whouse.name);
	$('select[name="q1"]').append(option);
}

var rows = alasql('SELECT * FROM kind;');
for (var i = 0; i < rows.length; i++) {
	var row = rows[i];
	var option = $('<option>');
	option.attr('value', row.kind.id);
	option.text(row.kind.text);
	$('select[name="q2"]').append(option);
}

// 検索条件の取得
var q1 = parseInt($.url().param('q1') || '0');
$('select[name="q1"]').val(q1);
var q2 = parseInt($.url().param('q2') || '0');
$('select[name="q2"]').val(q2);
var q3 = $.url().param('q3') || '';
$('input[name="q3"]').val(q3);

// SQLの生成
var sql = 'SELECT * FROM stock \
	JOIN whouse ON whouse.id = stock.whouse \
	JOIN item ON item.id = stock.item \
	JOIN kind ON kind.id = item.kind \
	WHERE item.code LIKE ? ';

sql += q1 ? 'AND whouse.id = ' + q1 + ' ' : '';
sql += q2 ? 'AND kind.id = ' + q2 + ' ' : '';

// SQL実行
var stocks = alasql(sql, [ q3 + '%' ]);

// HTML作成
var tbody = $('#tbody-stocks');
for (var i = 0; i < stocks.length; i++) {
	var stock = stocks[i];
	var tr = $('<tr data-href="stock-out.html?id=' + stock.stock.id + '"></tr>');
	tr.append('<td>' + stock.whouse.name + '</td>');
	tr.append('<td>' + stock.kind.text + '</td>');
	tr.append('<td>' + stock.item.code + '</td>');
	tr.append('<td>' + stock.item.maker + '</td>');
	tr.append('<td>' + stock.item.detail + '</td>');
	tr.append('<td id="state_row_id' + stock.stock.id + '"></td>'); //idのみ準備
	tr.appendTo(tbody);
}

//ステータス追加(purpose:2, state:ダブりなし)
var state_rows = alasql('SELECT DISTINCT stock, purpose, state FROM trans JOIN stock ON stock.id = trans.stock WHERE purpose = 2 ORDER BY state');
for (var i = 0; i < state_rows.length; i++) {
	var state_row = state_rows[i];
	var state_id = "#state_row_id" + state_row.stock;
		if(state_row.state == 4){
			$('<span class="label label-danger" name="state_id_css4">受注済み</span>').appendTo(state_id);
		}
		if(state_row.state == 5){
			$('<span class="label label-warning" name="state_id_css5">納期確定済み</span>').appendTo(state_id);
		}
		if(state_row.state == 6 && $(state_id).children().length == 0){ //受注済み・納期確定済みがない場合のみ、出庫済み追加
			$('<span class="label label-success" name="state_id_css6">全件出庫済み</span>').appendTo(state_id);
		}
}

//受注済み・納期確定済み・出庫済みが何れも無い場合のみ、データなしラベル追加
for (var i = 0; i < stocks.length; i++) {
	var stock = stocks[i];
	var label_check_id = "#state_row_id" + stock.stock.id;
	if($(label_check_id).children().length == 0){
		$('<span class="label label-default" name="state_id_css6">データなし</span>').appendTo(label_check_id);
	}
}

//ページ読み込み時、出庫済みは非表示
$('span[name="state_id_css6"]').parent().parent().css("display","none");

//チェックボックスクリック(全て表示)
$(function(){
	$(document).on("click","#checkbox_set1_state6",function() {
		if ($("[name=checkbox_state6]").prop("checked") == true){	//offにするとき
			$('#checkbox_set1_state6').replaceWith('<label class="btn btn-default btn-xs" id="checkbox_set1_state6">\
			<input type="checkbox" name="checkbox_state6" autocomplete="off"> 全て表示</label>')
			$('span[name="state_id_css6"]').parent().parent().css("display","none");
		}
		else{	//onにするとき
			$('#checkbox_set1_state6').replaceWith('<label class="btn btn-info btn-xs active" id="checkbox_set1_state6">\
			<input type="checkbox" name="checkbox_state6" autocomplete="off" checked> 全て表示</label>')
			$('span[name="state_id_css6"]').parent().parent().css("display","");
		}
	});
});

// クリック動作
$('tbody > tr').css('cursor', 'pointer').on('click', function() {
	window.location = $(this).attr('data-href');
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