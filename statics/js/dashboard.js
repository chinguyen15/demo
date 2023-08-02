

  $('#findBtn').click(function(e) {
    e.preventDefault();
    let tbody = $('#listOfStudentTable tbody');
    tbody.empty();

    // get value from input
    let student_id = $("#student_id").val();
    let student_fullname = $("#student_fullname").val();
    let student_phone_number = $("#student_phone_number").val();
    let student_address = $("#student_address").val();
    let student_major = $("#student_major").val();
    let student_college = $("#student_college").val();
    let student_internship = $("#student_internship").val();

    let data = JSON.stringify({
        "student_id": student_id !== "" ? student_id : " ",
        "student_fullname": student_fullname !== "" ? student_fullname : " ",
        "student_phone_number": student_phone_number  !== "" ? student_phone_number : " ",
        "student_address": student_address  !== "" ? student_address : " ",
        "student_major": student_major  !== "" ? student_major : " ",
        "student_college": student_college  !== "" ? student_college : " ",
        "student_internship": student_internship  !== "" ? student_internship : " "
    });

    $.ajax({
        url: 'search_with_filter',
        type: 'POST',
        headers: {
            "accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem('token')
        },
        data: data,
        success: function(response){
            let data = JSON.parse(response).data;
            if(data.length > 0){
                for(i of data){
                    let row = '<tr><td>' + i.student_id + '</td><td>' + i.fullname + '</td><td>' + i.major + '</td><td>' + i.college + '</td><td><a href="thongtinsinhvien?id=' + i.id + '" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-eye"></i></a></td></tr>';
                    tbody.append(row);
                }
            }else{
                tbody.append('<tr><td colspan="4">Không tìm thấy sinh viên</td></tr>');     
            }
        },
        error: function(xhr, status, error){
            tbody.append('<tr><td colspan="4">Không tìm thấy sinh viên</td></tr>');     
        }
    });
});

$.ajax({
    url: 'chart_drawing',
    type: 'GET',
    headers: {
                "accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem('token')
            },
    success: function(response){
        // Donut chart for major
        var majorChart = document.getElementById('byMajorChart').getContext('2d');
        var myMajorChart = new Chart(majorChart, {
        type: 'doughnut',
        data: {
            labels: Object.keys(response.major),
            datasets: [{
                data: Object.values(response.major),
                borderWidth: 1
            }],
            hoverOffset: 4
        },
        options: {
            responsive: true,
            cutoutPercentage: 70, // Độ lớn của lỗ trống ở giữa (giữa các vòng)
            plugins: {
            legend: {
                position: 'bottom'
            }
            }
        }
        });
        // Bars chart for college
        var byCollegeChart = document.getElementById('byCollegeChart').getContext('2d');
        var myCollegeChart = new Chart(byCollegeChart, {
        type: 'pie',
        data: {
            labels: Object.keys(response.college),
            datasets: [{
                data: Object.values(response.college),
                borderWidth: 1,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(255, 159, 64, 0.8)',
                    'rgba(255, 205, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                    'rgba(201, 203, 207, 0.8)'
                ]
            }],
            hoverOffset: 4
        },
        options: {
            responsive: true,
            plugins: {
            legend: {
                position: 'bottom'
            }
            }
        }
        });
    }
});

// Draw mixed chart
$.ajax({
    url: 'avg_points',
    type: 'GET',
    headers: {
                "accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem('token')
            },
    success: function(response){
        let maxPoint = []
        let internName = []
        let avgPoint = []
        response.data.forEach(element => {
            maxPoint.push(element['max_point']);
            internName.push(element['intern']);
            avgPoint.push(parseFloat(element['total_point'] / element['total_student']));
        });

        let avgPointChart = document.getElementById('byAvgPointChart').getContext('2d');
        let myAvgPointChart = new Chart(avgPointChart, {
            data: {
                datasets: [
                    {
                        type: 'line',
                        label: 'Điểm trung bình',
                        data: avgPoint,
                    },
                    {
                        type: 'bar',
                        label: 'Điểm cao nhất',
                        data: maxPoint,
                    }
                ],
                labels: internName
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
});