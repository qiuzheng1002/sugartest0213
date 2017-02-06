// SQL(itemより)
var items = alasql('SELECT * FROM item JOIN kind ON kind.id = item.kind');

// HTML作成
var tbody = $('#tbody-item');
for (var i = 0; i < items.length; i++) {
	var item_object = items[i];
	var item = $(item_object).attr("item"); //object皮むき(item)
	var item_kind = $(item_object).attr("kind"); //object皮むき(kind)
	var tr = $('<tr data-href="item-info.html?id=' + item.id + '"></tr>');
	tr.append('<td class="table-data">' + item.id + '</td>');
	tr.append('<td>' + item.code + '</td>');
	tr.append('<td>' + item_kind.text + '</td>');
	tr.append('<td>' + item.maker + '</td>');
	tr.append('<td>' + item.detail + '</td>');
	tr.append('<td>' + item.price + '</td>');
	tr.append('<td>' + item.leadtime + '</td>');
	tr.append('<td>' + item.lack + '</td>');
	tr.appendTo(tbody);
}

//登録データ0件の処理
var table_length = index_item_table.rows.length;
if (table_length == 1){
	var tr = $('<tr data-href="index-item-info.html">').appendTo(tbody);
	tr.append('<td>登録データなし</td>');
	tr.append('<td>-</td>');
	tr.append('<td>-</td>');
	tr.append('<td>-</td>');
	tr.append('<td>-</td>');
	tr.append('<td>-</td>');
	tr.append('<td>-</td>');
	tr.append('<td>-</td>');
}

// 新規登録ボタン
function add_data(){
	window.location.assign('item-info.html');
};

// クリック動作
$('tbody > tr').css('cursor', 'pointer').on('click', function() {
	window.location = $(this).attr('data-href');
});
