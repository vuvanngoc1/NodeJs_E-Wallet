function deleteRow(r) {
    var i = r.parentNode.parentNode.rowIndex;
    document.getElementById("myTable").deleteRow(i);
  }
  jQuery(function () {
    jQuery(".trash").click(function () {
      swal({
        title: "Cảnh báo",
       
        text: "Bạn có chắc chắn là muốn xóa?",
        buttons: ["Hủy bỏ", "Đồng ý"],
      })
        .then((willDelete) => {
          if (willDelete) {
            swal("Đã xóa thành công.!", {
              
            });
          }
        });
    });
  });
  oTable = $('#sampleTable').dataTable();
  $('#all').click(function (e) {
    $('#sampleTable tbody :checkbox').prop('checked', $(this).is(':checked'));
    e.stopImmediatePropagation();
  });

  