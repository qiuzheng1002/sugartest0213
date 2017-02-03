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

// 新規登録ボタン
function add_data(){
	window.location.assign('kind-info.html');
};

// クリック動作
$('tbody > tr').css('cursor', 'pointer').on('click', function() {
	window.location = $(this).attr('data-href');
});