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
    // Check if submited from cookie
    if (document.cookie.indexOf('session_id') !== -1){
      // Check if group id is not existed
      if (document.cookie.indexOf('group_id') == -1){
        $("#registerBtn").click(function(e){
          e.preventDefault();
          let group_id = $("#registerBtn").val();
          let session_id = decodeURIComponent(document.cookie).split('=')[1]
          
          $.ajax({
            url: 'dangkynhom',
            type: 'POST',
            headers:  {
              "accept": "application/json",
              "Content-Type": "application/json"
            },
            data: JSON.stringify({'group_id': group_id, 'session_id': session_id}),
            success: function(response){
              if(response.result==="OK"){
                  toastMixin.fire({
                      // animation: true,
                      title: 'Đăng ký thành công'
                  });
                  $('#registerBtn').prop('hidden', true);
                  $('#cancelRegisterBtn').prop('hidden', false);
                  // Set cookie
                  const d = new Date();
                  d.setTime(d.getTime() + (30*24*60*60*1000));
                  let expires = "expires="+ d.toUTCString();
                  document.cookie = "group_id=" + (response.group_id) + ";" + expires + ";path=/";
                }else{
                  toastMixin.fire({
                    // animation: true,
                    icon: 'error',
                    title: 'Đã xảy ra lỗi'
                  });
                }
              }
          });
        });
      }else{
        // Check group id
        let group_id_cookie = decodeURIComponent(document.cookie).split('group_id=')[1]
        let group_id = $("#cancelRegisterBtn").val();

        if(group_id === group_id_cookie){
          $('#registerBtn').prop('hidden', true);
          $('#cancelRegisterBtn').prop('hidden', false);

          $('#cancelRegisterBtn').click(function(e){
            e.preventDefault();
            let session_id = decodeURIComponent(document.cookie).split('=')[1]
            $.ajax({
              url: 'huydangkynhom',
              type: 'POST',
              headers:  {
                "accept": "application/json",
                "Content-Type": "application/json"
              },
              data: JSON.stringify({'session_id': session_id.split(';')[0], 'group_id': group_id}),
              success: function(response){
                if(response.result === "OK"){
                  $('#registerBtn').prop('hidden', false);
                  $('#cancelRegisterBtn').prop('hidden', true);
                  toastMixin.fire({
                        // animation: true,
                        title: 'Hủy đăng ký thành công'
                    });
                  // Set cookie
                  const d = new Date();
                  d.setTime(d.getTime());
                  let expires = "expires="+ d.toUTCString();
                  document.cookie = "group_id=" + (response.group_id) + ";" + expires + ";path=/";
                }else{
                  toastMixin.fire({
                        icon: 'error',
                        title: 'Hủy đăng ký thất bại'
                    });
                }
              },
              error: function(xhr, status ,error){
                toastMixin.fire({
                        icon: 'error',
                        title: 'Hủy đăng ký thất bại'
                    });
              }
            });
          });
        }else{
          $('#registerBtn').prop('hidden', false);
          $('#registerBtn').prop('disabled', true);
          $('#cancelRegisterBtn').prop('hidden', true);
        }
      }
    }else{
      let end = $('#internship').val().split(' - ')[1];
        let endDate = new Date(end.split('/')[1] + '-' + end.split('/')[0] + '-' + end.split('/')[2]);
        let today = new Date();
        console.log(end)
        if(endDate < today){
            $('#registerBtn').prop('hidden', true);
            $('#registerBtn').prop('disabled', true);
            $('#cancelRegisterBtn').prop('hidden', true);
        }
    }
  });