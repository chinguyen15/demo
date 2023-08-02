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
let token = localStorage.getItem('token');
let dataTable = $('#bangdanhsachnhom').DataTable({
    paging: false,
    searching: false,
    options:{
        info: "Tổng _TOTAL_ nhóm",
    },
    order: [[1, 'desc']],
    "ajax": {
        "url": "dsnhom", 
        "dataSrc": "",
        headers: {
            "accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem('token')
            },
    },
    "columns": [
        { "data": "project_name" },
        { 
            "data": "internship",
            "render": function(data, type, row){
                if(token){
                    return data;
                }else{
                    let end = data.split(' - ')[1];
                    let endDate = new Date(end.split('/')[1] + '-' + end.split('/')[0] + '-' + end.split('/')[2]);
                    let today = new Date();

                    if(endDate < today){
                        return '';
                    }else{
                        return data;
                    }
                }
            }
        },
        { "data": "instructor_name" },
        {
            "data": "group_id",
            "render": function(data, type, row) {
                if(token){
                    return '<a href="chitietnhom?id='+data+'" class="btn btn-sm" id="editBtn" style="color: green;"><i class="fa-solid fa-eye"></i></a><button class="btn btn-sm" id="editBtn" style="color: blue;" data-id="'+data+'"><i class="fa-solid fa-pen-to-square"></i></button><button class="btn btn-sm" style="color: red;" id="deleteBtn" data-id="'+data+'"><i class="fa-solid fa-trash"></i></button>';
                }else{
                    $('#addProjectBtn').prop('hidden', true);
                    return '<a href="chitietnhom?id='+data+'" class="btn btn-sm" id="editBtn" style="color: green;"><i class="fa-solid fa-eye"></i></a>';
                }
            }
        }
    ]
});

// Delete func
$("#bangdanhsachnhom").on('click', '#deleteBtn', function(){
    let id = $(this).data('id');

    $.ajax({
    url: 'xoanhomthuctap',
    type: 'POST',
    headers: {
        "accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem('token')
        },
    data: JSON.stringify({'id': id, 'isDeleted': true}),
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
$("#bangdanhsachnhom").on('click', '#editBtn', function(){
    let id = $(this).data('id');

    $.ajax({
    url: 'thongtintaonhom',
    type: 'GET',
    headers: {
        "accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem('token')
        },
    success: function(data){
        let projects = data.projects
        let instructors = data.instructors
        let internships = data.internships

        $.each(projects, function(index, value){
            $('#editProject').append('<option value="'+value.id+'">'+value.name+'</option>');
        });

        $.each(internships, function(index, value){
            $('#editInternship').append('<option value="'+value.id+'">'+value.internship+'</option>');
        });
        
        $.each(instructors, function(index, value){
            $('#editInstructor').append('<option value="'+value.id+'">'+value.fullname+'</option>');
        });
        
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
    let project = $('#editProject').val();
    let instructor = $('#editInstructor').val();
    let internship = $('#editInternship').val();
    let id = $('#editModal').data('id');

    $.ajax({
    url: 'capnhatnhomthuctap',
    method: 'POST',
    headers: {
            "accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem('token')
        },
    data: JSON.stringify({'id': id, 'project': project, 'internship': internship, 'instructor': instructor, 'isDeleted': false, 'createdAt': new Date().getTime()}),
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

$('#addProjectBtn').click(function(e){
    e.preventDefault();

    $.ajax({
        url: 'thongtintaonhom',
        type: 'GET',
        headers: {
            "accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem('token')
        },
        success: function(data){
            let projects = data.projects
            let instructors = data.instructors
            let internships = data.internships

            $.each(projects, function(index, value){
                $('#project').append('<option value="'+value.id+'">'+value.name+'</option>');
            });

            $.each(internships, function(index, value){
                $('#internship').append('<option value="'+value.id+'">'+value.internship+'</option>');
            });
            
            $.each(instructors, function(index, value){
                $('#instructor').append('<option value="'+value.id+'">'+value.fullname+'</option>');
            });
            
            $('#addProjectModal').modal('show');
        }
    });
});

// Add func
$('#addBtn').click(function(e){
    e.preventDefault();
    let instructor = $("#instructor").val()
    let project = $("#project").val();
    let internship = $("#internship").val();

    $.ajax({
    url: 'themnhom',
    type: 'POST',
    headers:  {
            "accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem('token')
        },
    data: JSON.stringify({'project': project, 'instructor': instructor, 'internship': internship, 'isDeleted': false, 'createdAt': new Date().getTime()}),
    success: function(response){
        if(response.status === "OK"){
        toastMixin.fire({
            title: 'Thêm thành công'
            });
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