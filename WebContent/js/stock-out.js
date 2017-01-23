// ID取得
var id = parseInt($.url().param('id'));
$("input[name=id]").val(id);

//変更
// トランザクション読み込み
var rows = alasql('SELECT * FROM trans WHERE stock = ?', [ id ]);
var tbody = $('#tbody-shukko_process_table');
for (var i = 0; i < rows.length; i++) {
	var row = rows[i];
	var purpose_check = row.trans.purpose;
	var state_check = row.trans.state;
	if (purpose_check == 2){
		var tr = $('<tr>').appendTo(tbody);
		tr.append('<td>' + row.trans.date + '</td>');
		tr.append('<td>' + row.trans.shop + '</td>');
		tr.append('<td>' + row.trans.num + '</td>');	
		tr.append('<td>' + row.trans.deadline + '</td>');
		if (state_check == 4){
			tr.append('<td>' + '受注済み' + '</td>');
		}
		else if (state_check == 5){
			tr.append('<td>' + '納期回答済み' + '</td>');
		}
		else if (state_check == 6){
			tr.append('<td>' + '出庫済み' + '</td>');
		}
	tr.append('<td class="text-right"><button type="button" class="btn btn-xs" id="delete_data_address" data-toggle="modal" data-target="#delete_data"><span class="glyphicon glyphicon-remove"></span></button></td>');
	}
}
