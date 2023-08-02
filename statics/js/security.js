window.onload = function(){
    let token = localStorage.getItem('token');
    let navbar = document.getElementById('navbarTogglerDemo02');
    if(!token){
        if(String(window.location.href).split('/').slice(-1).includes('nhomthuctap')){
            navbar.innerHTML += '<ul class="navbar-nav me-auto mb-2 mb-lg-0"><li class="nav-item"><a class="nav-link active" aria-current="page" href="/nhomthuctap">Nhóm thực tập</a></li></ul>';
        }else{
            window.location.href='/login';
        }
    }else{

        $.ajax({
            url: 'get_user',
            type: 'POST',
            headers: {
                "Authorization": "Bearer " + token,
            },
            success: function(response){
                localStorage.setItem('user', response);
                navbar.innerHTML += '<ul class="navbar-nav me-auto mb-2 mb-lg-0"><li class="nav-item"><a class="nav-link active" aria-current="page" href="/">Dashboard</a></li><li class="nav-item"><a class="nav-link active" aria-current="page" href="/nhomthuctap">Nhóm thực tập</a></li><li class="nav-item">  <a class="nav-link active" aria-current="page" href="/detaithuctap">Đề tài thực tập</a></li><li class="nav-item">  <a class="nav-link active" aria-current="page" href="/dskythuctap">Kỳ thực tập</a></li></ul>';
            },
            error: function(xhr, status, error){
                window.location.href='/login';
            }
        });
    }
  }