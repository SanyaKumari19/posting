window.onload = function() {
    axios({
        method: 'get',
        url: location.protocol + '//' + location.host + '/api/user/data',
    }).then((res) => {
        console.log(res.data);
        document.getElementById('name').innerHTML = res.data.name;
        // document.getElementById('number').innerHTML = res.data.number;
        // document.getElementById('enroll').innerHTML = res.data.enroll;
        document.getElementById('username').innerHTML = '@' + res.data.email.substring(0, res.data.email.indexOf('@'));
        window.uname = res.data.name;
        window.username = res.data.email.substring(0, res.data.email.indexOf('@'));
        window.usernumber = res.data.number;
        window.userid = res.data._id;
        window.userpic = res.data.pic;
        window.userpicType = res.data.picType;
        axios({
            method: 'get',
            url: location.protocol + '//' + location.host + '/api/files/get/' + res.data.pic,
            responseType: 'arraybuffer',
            headers: { "Content-Type": res.data.picType }
        }).then((res) => {
            var blob = new Blob([res.data], { type: res.headers['content-type'] });
            var url = window.URL.createObjectURL(blob);
            document.querySelector('.profile-pic').src = url;
            window.userpicurl = url;
        }).catch((err) => {
            console.log(err);
        });
        getAllPosts();
    }).catch((err) => {
        console.log(err);
    });
}
const file_input = document.getElementById('files-input');
let allFiles = {};
file_input.addEventListener('input', (e) => {
    const files = Array.from(e.target.files);
    console.log(files);

    files.forEach(file => {
        const uuid = new uuidv4();
        allFiles[file.name] = { uuid: uuid, file: file };
        document.querySelector('.new-post-img').src = URL.createObjectURL(file);
    });
})

const pic_input = document.getElementById('pic-input');

pic_input.addEventListener('input', (e) => {
    const files = Array.from(e.target.files);
    console.log(files);

    files.forEach(file => {
        const uuid = new uuidv4();
        // allFiles[file.name] = { uuid: uuid, file: file };
        document.querySelector('.profile-pic').src = URL.createObjectURL(file);
        let formData = new FormData();
        // console.log(allFiles[file].file);
        formData.append('file', file);
        formData.append('uuid', uuid);
        axios({
            method: 'post',
            url: location.protocol + '//' + location.host + '/api/user/pic',
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }).then((res) => {
            console.log(res.data);
        }).catch((err) => {
            console.log(err);
        });
    });
})

function changeDP() {
    document.getElementById('pic-input').click();
}

let dp_url = {};

function createPost() {
    if (Object.keys(allFiles).length > 0) {
        Object.keys(allFiles).forEach(file => {
            let formData = new FormData();
            console.log(allFiles[file].file);
            formData.append('file', allFiles[file].file);
            formData.append('uuid', allFiles[file].uuid);
            formData.append('name', window.uname);
            formData.append('username', window.username);
            formData.append('msg', document.getElementById('newPostMsg').value);
            formData.append('time', Date.now());
            formData.append('pic', window.userpic);
            formData.append('picType', window.userpicType);
            axios({
                method: 'post',
                url: location.protocol + '//' + location.host + '/api/post/imgcreate',
                data: formData,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }).then((res) => {
                console.log(res.data);
                document.getElementById('newPostMsg').value = '';
                const template = document.querySelector('template[data-template="tweet-template"]');
                const clone = template.content.cloneNode(true);
                clone.querySelector('.tweet').setAttribute('id', res.data._id);
                clone.querySelector('.profile-dp').src = window.userpicurl;
                clone.querySelector('.profile-name').innerHTML = window.uname + ' <span class="profile-id">@' + window.username + '</span>';
                // clone.querySelector('.profile-id').innerHTML = '@' + window.username;
                clone.querySelector('.tweet-text').innerHTML = '<p>' + res.data.msg + '<p>' + '<br><br><img src="' + URL.createObjectURL(allFiles[file].file) + '" alt="Image" class="tweet-img">';

                clone.querySelector('.tweet-time').innerHTML = new Date(parseInt(res.data.time)).toString().substring(4, 21);
                clone.querySelector('.like-count').innerHTML = res.data.likecount;
                clone.querySelector('.like-count').setAttribute('id', res.data._id + '-likecount');
                clone.querySelector('.like-button').setAttribute('id', res.data._id + '-likebutton');
                clone.querySelector('.like-button').setAttribute('onclick', 'incrementLikes(this.id)');
                document.querySelector('.posts').prepend(clone);
                document.querySelector('.new-post-img').src = "";
            }).catch((err) => {
                console.log(err);
            });
            // delete allFiles[file];
        })
    } else {
        axios({
            method: 'post',
            url: location.protocol + '//' + location.host + '/api/post/create',
            data: { msg: document.getElementById('newPostMsg').value, username: username, name: uname, time: Date.now(), pic: userpic, picType: userpicType },
        }).then((res) => {
            console.log(res.data);
            document.getElementById('newPostMsg').value = '';
            const template = document.querySelector('template[data-template="tweet-template"]');
            const clone = template.content.cloneNode(true);
            clone.querySelector('.tweet').setAttribute('id', res.data._id);
            clone.querySelector('.profile-dp').src = window.userpicurl;
            clone.querySelector('.profile-name').innerHTML = window.uname + ' <span class="profile-id">@' + window.username + '</span>';
            // clone.querySelector('.profile-id').innerHTML = '@' + window.username;
            clone.querySelector('.tweet-text').innerHTML = '<p>' + res.data.msg + '<p>';
            clone.querySelector('.tweet-time').innerHTML = new Date(parseInt(res.data.time)).toString().substring(4, 21);
            clone.querySelector('.like-count').innerHTML = res.data.likecount;
            clone.querySelector('.like-count').setAttribute('id', res.data._id + '-likecount');
            clone.querySelector('.like-button').setAttribute('id', res.data._id + '-likebutton');
            clone.querySelector('.like-button').setAttribute('onclick', 'incrementLikes(this.id)');
            document.querySelector('.posts').prepend(clone);
        }).catch((err) => {
            console.log(err);
        });
    }

}

function incrementLikes(id) {
    axios({
        method: 'post',
        url: location.protocol + '//' + location.host + '/api/post/incrementlikes',
        data: { postid: id.substring(0, id.indexOf('-')) },
    }).then((res) => {
        console.log(res.data);
        document.getElementById(res.data._id + '-likecount').innerHTML = res.data.likecount;
    }).catch((err) => {
        console.log(err);
    });
}

function getAllPosts() {
    axios({
        method: 'get',
        url: location.protocol + '//' + location.host + '/api/post/getall',
    }).then((res) => {
        console.log(res.data);
        res.data.forEach((post) => {
            if (post.img) {
                console.log(post.img, post.imgType);
                axios({
                    method: 'get',
                    url: location.protocol + '//' + location.host + '/api/files/get/' + post.img,
                    responseType: 'arraybuffer',
                    headers: { "Content-Type": post.imgType }
                }).then((res) => {
                    let fileBlob = new Blob([res.data], { type: post.imgType });
                    let url = URL.createObjectURL(fileBlob); //fileBlob has blob
                    const template = document.querySelector('template[data-template="tweet-template"]');
                    const clone = template.content.cloneNode(true);
                    clone.querySelector('.tweet').setAttribute('id', post._id);
                    clone.querySelector('.profile-name').innerHTML = post.name + ' <span class="profile-id">@' + post.username + '</span>';
                    // clone.querySelector('.profile-id').innerHTML = '@' + post.user.email.substring(0, post.user.email.indexOf('@'));
                    clone.querySelector('.tweet-text').innerHTML = '<p>' + post.msg + '<p>' + '<img src="' + url + '" alt="">';
                    clone.querySelector('.tweet-time').innerHTML = new Date(parseInt(post.time)).toString().substring(4, 21);
                    clone.querySelector('.like-count').innerHTML += post.likecount;
                    clone.querySelector('.like-count').setAttribute('id', post._id + '-likecount');
                    clone.querySelector('.like-button').setAttribute('id', post._id + '-likebutton');
                    clone.querySelector('.like-button').setAttribute('onclick', 'incrementLikes(this.id)');
                    document.querySelector('.posts').prepend(clone);
                    let tweet = document.getElementById(post._id);
                    if (dp_url[post.user]) {
                        console.log('dp found');
                        tweet.querySelector('.profile-dp').src = dp_url[post.user];
                    } else {
                        console.log('dp not found');
                        axios({
                            method: 'get',
                            url: location.protocol + '//' + location.host + '/api/user/getdp/' + post.user,
                            responseType: 'arraybuffer',
                            // headers: { "Content-Type": post.picType }
                        }).then((res) => {
                            if (!res.msg) {
                                let blob = new Blob([res.data], { type: res.picType });
                                dp_url[post.user] = URL.createObjectURL(blob);
                                tweet.querySelector('.profile-dp').src = dp_url[post.user];
                            } else {
                                tweet.querySelector('.profile-dp').src = '/images/default.png';
                            }
                        }).catch((err) => {
                            console.log(err);
                        });
                    }



                }).catch((err) => {
                    console.log(err);
                });
            } else {
                const template = document.querySelector('template[data-template="tweet-template"]');
                const clone = template.content.cloneNode(true);
                clone.querySelector('.tweet').setAttribute('id', post._id);
                clone.querySelector('.profile-name').innerHTML = post.name + ' <span class="profile-id">@' + post.username + '</span>';
                // clone.querySelector('.profile-id').innerHTML = '@' + post.user.email.substring(0, post.user.email.indexOf('@'));
                clone.querySelector('.tweet-text').innerHTML = '<p>' + post.msg + '<p>';
                clone.querySelector('.tweet-time').innerHTML = new Date(parseInt(post.time)).toString().substring(4, 21);
                clone.querySelector('.like-count').innerHTML += post.likecount;
                clone.querySelector('.like-count').setAttribute('id', post._id + '-likecount');
                clone.querySelector('.like-button').setAttribute('id', post._id + '-likebutton');
                clone.querySelector('.like-button').setAttribute('onclick', 'incrementLikes(this.id)');
                document.querySelector('.posts').prepend(clone);
                let tweet = document.getElementById(post._id);
                if (dp_url[post.user]) {
                    console.log('dp found');
                    tweet.querySelector('.profile-dp').setAttribute('src', dp_url[post.user]);
                } else {
                    console.log('dp not found');
                    axios({
                        method: 'get',
                        url: location.protocol + '//' + location.host + '/api/user/getdp/' + post.user,
                        responseType: 'arraybuffer',
                        // headers: { "Content-Type": post.picType }
                    }).then((res) => {
                        if (!res.msg) {
                            let blob = new Blob([res.data], { type: res.picType });
                            dp_url[post.user] = URL.createObjectURL(blob);
                            tweet.querySelector('.profile-dp').setAttribute('src', dp_url[post.user]);
                        } else {
                            tweet.querySelector('.profile-dp').setAttribute('src', '/images/default.png');
                        }
                    }).catch((err) => {
                        console.log(err);
                    });
                }


            }

        });
    }).catch((err) => {
        console.log(err);
    });
}