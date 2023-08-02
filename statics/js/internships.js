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

$(document).ready(function(){
    $('#start').datepicker({
        format: 'dd/mm/yyyy',
        autoclose: true
    });

    $('#end').datepicker({
        format: 'dd/mm/yyyy',
        autoclose: true
    });

    $('#editStart').datepicker({
        format: 'dd/mm/yyyy',
        autoclose: true
    });

    $('#editEnd').datepicker({
        format: 'dd/mm/yyyy',
        autoclose: true
    });

    let dataTable = $('#bangdanhsachkythuctap').DataTable({
        paging: false,
        searching: false,
        options:{
            info: "Tổng _TOTAL_ đề tài",
        },
        "ajax": {
            "url": "get_dskythuctap", 
            "dataSrc": "",
            headers: {
                "accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem('token')
                },
            },
        "columns": [
            { "data": "start" },
            { "data": "end" },
            {
                "data": "id",
                "render": function(data, type, row) {
                    return '<button class="btn btn-sm" id="viewBtn" style="color: green;" data-id="'+data+'"><i class="fa-solid fa-eye"></i></button><button class="btn btn-sm" id="editBtn" style="color: blue;" data-id="'+data+'"><i class="fa-solid fa-pen-to-square"></i></button><button class="btn btn-sm" style="color: red;" id="deleteBtn" data-id="'+data+'"><i class="fa-solid fa-trash"></i></button>';
                }
            }
        ]
    });

    // Delete func
    $("#bangdanhsachkythuctap").on('click', '#deleteBtn', function(){
        let id = $(this).data('id');

        $.ajax({
        url: 'capnhatkythuctap',
        type: 'POST',
        headers: {
            "accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem('token')
            },
        data: JSON.stringify({'id': id, 'start': ' ', 'end': ' ', 'isDeleted': true}),
        success: function(response){
            if (response.status==='OK'){
                toastMixin.fire({
                        title: 'Đã xóa đề tài!'
                });
                dataTable.ajax.reload();
            }else{
                toastMixin.fire({
                    icon: 'error',
                    title: 'Xóa đề tài thất bại'
                });
            }
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
    $("#bangdanhsachkythuctap").on('click', '#editBtn', function(){
        let id = $(this).data('id');

        $.ajax({
        url: 'get_kythuctap?id='+id,
        type: 'GET',
        headers: {
            "accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem('token')
            },
        success: function(response){
            $('#editStart').val(response.start);
            $('#editEnd').val(response.end);
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

    // View func
    $("#bangdanhsachkythuctap").on('click', '#viewBtn', function(){
        let id = $(this).data('id');

        $.ajax({
        url: 'get_kythuctap?id='+id,
        type: 'GET',
        headers: {
            "accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem('token')
            },
        success: function(response){
            console.log(response)
            $('#startDate').val(response.start);
            $('#endDate').val(response.end);
            $('#projects').val(response.projects.join('\n- '));
            $('#instructors').val(response.instructors.join('\n- '));
            $('#seeMore').modal('show');
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
        let start = $('#editStart').val();
        let end = $('#editEnd').val();
        let id = $('#editModal').data('id');

        let startDate = new Date(start.split('/')[1] + '-' + start.split('/')[0] + '-' + start.split('/')[2]);
        let endDate = new Date(end.split('/')[1] + '-' + end.split('/')[0] + '-' + end.split('/')[2]);

        if(startDate < endDate){
            $.ajax({
            url: 'capnhatkythuctap',
            method: 'POST',
            headers: {
                    "accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem('token')
                },
            data: JSON.stringify({'id': id, 'start': start, 'end': end, 'isDeleted': false, 'createdAt': new Date().getTime()}),
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
        }else{
            toastMixin.fire({
                title: 'Ngày bắt đầu phải nhỏ hơn ngày kết thúc!',
                icon: 'error',
            })
        }

    });

    // Add func
    $('#addBtn').click(function(e){
        e.preventDefault();
        let start = $("#start").val();
        let end = $("#end").val();

        let startDate = new Date(start.split('/')[1] + '-' + start.split('/')[0] + '-' + start.split('/')[2]);
        let endDate = new Date(end.split('/')[1] + '-' + end.split('/')[0] + '-' + end.split('/')[2]);

        if(startDate < endDate){
            $.ajax({
                url: 'themkythuctap',
                type: 'POST',
                headers:  {
                        "accept": "application/json",
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + localStorage.getItem('token')
                    },
                data: JSON.stringify({'start': start, 'end': end, 'isDeleted': false, 'createdAt': new Date().getTime()}),
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
        }else{
            toastMixin.fire({
                icon: 'error',
                title: 'Ngày bắt đầu phải nhỏ hơn ngày kết thúc!'
            });
        }
    });
});