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

$(document).ready(function() {
    // Auto complete province
    $("#diachisv").autocomplete({
        source: function(request, response) {
          let url = '/goiyxaphuong?q=' + request.term;

          $.ajax({
            url: url,
            dataType: "json",
            success: function(data){
              response(data.ds_diachi);
            }
          });
        },
        minLength: 1
    });

    // Check if submited from cookie
    if (document.cookie.indexOf('session_id') !== -1){
      let id = document.cookie.split('=')[1].split(';')[0];
      $.ajax({
        url: '/thongtinsinhvien',
        type: 'GET',
        data: {'id': id},
        success: function(response){
          // Disable all input
          $("#mssv").val(response.student_id);
          $("#mssv").prop('disabled', true);

          $("#hotensv").val(response.fullname);
          $("#hotensv").prop('disabled', true);

          $("#sdtsv").val(response.phone_number);
          $("#sdtsv").prop('disabled', true);

          $("#emailsv").val(response.email);
          $("#emailsv").prop('disabled', true);

          $("#diachisv").val(response.address);
          $("#diachisv").prop('disabled', true);

          $("#truongsv").val(response.college);
          $("#truongsv").prop('disabled', true);

          $("#chuyennganhsv").val(response.major);
          $("#chuyennganhsv").prop('disabled', true);

          $("#khoasv").val(response.course);
          $("#khoasv").prop('disabled', true);

          $("#submit_btn").text('SUMITTED');
          $("#submit_btn").prop('disabled', true);
        },
        error: function(xhr, status, error){
          $("#mssv").prop('disabled', false);
          $("#hotensv").prop('disabled', false);
          $("#sdtsv").prop('disabled', false);
          $("#emailsv").prop('disabled', false);
          $("#diachisv").prop('disabled', false);
          $("#truongsv").prop('disabled', false);
          $("#chuyennganhsv").prop('disabled', false);
          $("#khoasv").prop('disabled', false);
          $("#submit_btn").text('SUMITTED');
          $("#submit_btn").prop('disabled', false);
        }
      });
    }
    // Submit form
    $("#svtt_form").submit(function(e){
      e.preventDefault(); // Stopping reload

      let formData = {"student_id": $("#mssv").val(), 
                      "fullname": $("#hotensv").val(), 
                      "phone_number": $("#sdtsv").val(),
                      "email": $('#emailsv').val(),
                      "address": $("#diachisv").val(),
                      "major": $("#chuyennganhsv").val(),
                      "course": parseInt($("#khoasv").val()),
                      "college": $("#truongsv").val(),
                      "intern_group": "",
                      "createdAt": new Date().getTime(),
                    }

      $.ajax({
        url: 'nhapthongtin',
        type: 'POST',
        headers: {
          "accept": "application/json",
          "Content-Type": "application/json"
        },
        data: JSON.stringify(formData),
        success: function(response){
          if(response.status==="OK"){
            toastMixin.fire({
                animation: true,
                title: 'Gửi thông tin thành công'
            });
            // Disable all input
            $("#mssv").prop('disabled', true);
            $("#hotensv").prop('disabled', true);
            $("#sdtsv").prop('disabled', true);
            $("#emailsv").prop('disabled', true);
            $("#diachisv").prop('disabled', true);
            $("#truongsv").prop('disabled', true);
            $("#chuyennganhsv").prop('disabled', true);
            $("#khoasv").prop('disabled', true);
            $("#submit_btn").text('SUMITTED');
            $("#submit_btn").prop('disabled', true);
            // Set cookie
            const d = new Date();
            d.setTime(d.getTime() + (30*24*60*60*1000));
            let expires = "expires="+ d.toUTCString();
            document.cookie = "session_id=" + (response.session_id) + ";" + expires + ";path=/";
          }else{
            toastMixin.fire({
              animation: true,
              icon: 'error',
              title: 'Vui lòng điền đầy đủ thông tin'
            });
          }
        },
        error: function(xhr, status, error){
          toastMixin.fire({
              animation: true,
              icon: 'error',
              title: 'Đã xảy ra lỗi'
            });
        }
      });
    });
  });