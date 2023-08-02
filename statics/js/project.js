// Toast
let toastMixin = Swal.mixin({
    toast: true,
    icon: 'success',
    title: 'General Title',
    position: 'top-right',
    showConfirmButton: false,
    timer: 1500,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  });

// Script datatable
$(document).ready(function(){
let dataTable = $('#bangdanhsachdetai').DataTable({
    paging: false,
    searching: false,
    options:{
    info: "Tổng _TOTAL_ đề tài",
    },
    "ajax": {
        "url": "dsdetai", 
        "dataSrc": "",
        headers: {
            "accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem('token')
            },
        },
    "columns": [
    { "data": "name" },
    { "data": "descriptions" },
    {
        "data": "id",
        "render": function(data, type, row) {
        return '<button class="btn btn-sm" id="editBtn" style="color: blue;" data-id="'+data+'"><i class="fa-solid fa-pen-to-square"></i></button><button class="btn btn-sm" style="color: red;" id="deleteBtn" data-id="'+data+'"><i class="fa-solid fa-trash"></i></button>';
        }
    }
    ]
});

// Delete func
$("#bangdanhsachdetai").on('click', '#deleteBtn', function(){
    let id = $(this).data('id');

    $.ajax({
    url: 'capnhatdetaithuctap',
    type: 'POST',
    headers: {
        "accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem('token')
        },
    data: JSON.stringify({'id': id, 'name': ' ', 'descriptions': ' ', 'isDeleted': true}),
    success: function(response){
        toastMixin.fire({
                title: 'Đã xóa đề tài!'
        });
        dataTable.ajax.reload();
    },
    error: function(xhr, status, error){
        toastMixin.fire({
                icon: 'error',
                title: 'Xóa đề tài thất bại'
        });
    }
    });
});

// edit func
$("#bangdanhsachdetai").on('click', '#editBtn', function(){
    let id = $(this).data('id');

    $.ajax({
    url: 'get_detai?id='+id,
    type: 'GET',
    headers: {
        "accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem('token')
        },
    success: function(response){
        $('#editName').val(response.name);
        $('#editDescription').val(response.descriptions);
        $('#editModal').data('id', id);
        $('#editModal').modal('show');
    },
    error: function(xhr, status, error){
        toastMixin.fire({
                icon: 'error',
                title: 'Vui lòng tải lại trang'
        });
    }
    });
});

// Save changes
$('#btnSaveChanges').click(function(){
    let name = $('#editName').val();
    let descriptions = $('#editDescription').val();
    let id = $('#editModal').data('id');

    $.ajax({
    url: 'capnhatdetaithuctap',
    method: 'POST',
    headers: {
            "accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem('token')
        },
    data: JSON.stringify({'id': id, 'name': name, 'descriptions': descriptions, 'isDeleted': false, 'createdAt': new Date().getTime()}),
    success: function(response){
        toastMixin.fire({
        title: 'Cập nhật thành công!'
        });
        dataTable.ajax.reload();
        $('#editModal').modal('hide');
    },
    error: function(xhr, status, error){
        toastMixin.fire({
        title: 'Cập nhật thất bại!',
        icon: 'error',
        });
    }
    });

});

// Add func
$('#addBtn').click(function(e){
    e.preventDefault();
    let project = $("#project").val();
    let descriptions = $("#descriptions").val();

    $.ajax({
    url: 'themdetaithuctap',
    type: 'POST',
    headers:  {
            "accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem('token')
        },
    data: JSON.stringify({'project': project, 'descriptions': descriptions}),
    success: function(response){
        if(response.status === "OK"){
        toastMixin.fire({
            title: 'Thêm thành công'
            });
        $('#project_info')[0].reset()
        dataTable.ajax.reload();
        }
    },
    error: function(xhr, status, err){
        toastMixin.fire({
            icon: 'error',
            title: 'Thêm thất bại'
        });
    }
    });
});
});