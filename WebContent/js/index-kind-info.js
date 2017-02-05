// SQL(kindより)
var kinds = alasql('SELECT * FROM kind');

// HTML作成
var tbody = $('#tbody-kinds');
for (var i = 0; i < kinds.length; i++) {
	var kind_object = kinds[i];
	var kind = $(kind_object).attr("kind"); //object皮むき
	var tr = $('<tr data-href="kind-info.html?id=' + kind.id + '"></tr>');
	tr.append('<td class="table-data">' + kind.id + '</td>');
	tr.append('<td>' + kind.text + '</td>');
	tr.appendTo(tbody);
}

//登録データ0件の処理
var table_length = index_kind_table.rows.length;
if (table_length == 1){
	var tr = $('<tr data-href="index-kind-info.html">').appendTo(tbody);
	tr.append('<td>登録データなし</td>');
	tr.append('<td>-</td>');
}

// 新規登録ボタン
function add_data(){
	window.location.assign('kind-info.html');
};

// クリック動作
$('tbody > tr').css('cursor', 'pointer').on('click', function() {
	window.location = $(this).attr('data-href');
});