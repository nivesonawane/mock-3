
const movieForm = document.getElementById("movieForm");
const movieTitleCtrl = document.getElementById("movieTitle");
const movieUrlCtrl = document.getElementById("movieUrl");
const movieDescCtrl = document.getElementById("movieDesc");
const movieRatingCtrl = document.getElementById("movieRating");
const submitBtn = document.getElementById("submitBtn");
const updateBtn = document.getElementById("updateBtn");
const movieContainer = document.getElementById("movieContainer");
const loader = document.getElementById("loader");

const baseUrl = `https://mock-3-12403-default-rtdb.asia-southeast1.firebasedatabase.app`;
const moviesurl = `${baseUrl}/movies.json`;

const hideLoader = () => {
    loader.classList.add("d-none");
}

const objToArr = (res) => {
    let movieArr = [];
    for(const key in res){
        let obj = {...res[key],id:key};
        movieArr.push(obj);
    }
    return movieArr;
}

const editMovie = async (ele) => {
    let editId = ele.closest(".col-md-4").id;
    localStorage.setItem("editId",editId);
    let editUrl = `${baseUrl}/movies/${editId}.json`;
    try{
      let res = await makeApiCall("GET",editUrl);
    //   console.log(res);
      movieTitleCtrl.value = res.movieTitle;
      movieDescCtrl.value = res.movieDesc;
      movieUrlCtrl.value = res.movieUrl;
      movieRatingCtrl.value = res.movieRating;

      window.scrollTo(0,0);
      submitBtn.classList.add("d-none");
      updateBtn.classList.remove("d-none");
    }
    catch(err){
        console.log(err);
    }
    finally{
        hideLoader();
    }
}


const deleteMovie = (ele) => {
    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
      }).then(async (result) => {
        if (result.isConfirmed) {
            let deleteId = ele.closest(".col-md-4").id;
            let deleteUrl = `${baseUrl}/movies/${deleteId}.json`;

            try{
                let res = await makeApiCall("DELETE",deleteUrl);
                ele.closest(".col-md-4").remove();
            }
            catch(err){
                console.log(err);
            }
            finally{
                hideLoader();
            }
           
          Swal.fire({
            title: "Deleted!",
            text: "Your movie has been deleted.",
            icon: "success",
            timer: 3000
          });
        }
      });
}

const createMovie = (obj) => {
    let col = document.createElement("div");
    col.id = obj.id;
    col.className = `col-md-4 movieContainer`;

    col.innerHTML = `<div class="card w-75">
                        <div class="card-header">
                            <h5 class="m-0 d-flex justify-content-between">
                                ${obj.movieTitle}
                                <small>Rating: ${obj.movieRating}/5</small>
                            </h5>
                        </div>
                        <div class="card-body">
                            <figure>
                                <img src="${obj.movieUrl}" class="img-fluid" alt="movieImg" title="movieImg">
                                <figcaption>
                                    <p class="mt-2">${obj.movieDesc}</p>
                                </figcaption>
                            </figure>
                        </div>
                        <div class="card-footer d-flex justify-content-between">
                            <button class="btn btn-success" onclick="editMovie(this)">Edit</button>
                            <button class="btn btn-danger" onclick="deleteMovie(this)">Delete</button>
                        </div>
                    </div>`;
    movieContainer.append(col);
}

const displayAllMovies = (arr) => {
    arr.forEach((movie) => {
        createMovie(movie)
    })
}

const makeApiCall = async (methodName,apiUrl,msgBody) => {
    let msgData = msgBody ? JSON.stringify(msgBody) : null;
    try{
        loader.classList.remove("d-none");
        let data = await fetch(apiUrl,{
            method: methodName,
            body: msgData,
            header: {
                "Content/type": "Application/json",
                "token": "test"
            }
        })
        return data.json();
    }
    catch(err){
        console.log(err);
    }
}

const fetchAllMovies = async () => {
    try{
      let res = await makeApiCall("GET",moviesurl);
    //   console.log(res);
      let movieArr = objToArr(res);
      displayAllMovies(movieArr);
    }
    catch(err){
        console.log(err);
    }
    finally{
        hideLoader();
    }
}

fetchAllMovies();

const submitMovie = async (eve) => {
    eve.preventDefault();
    let movieObj = {
        movieTitle: movieTitleCtrl.value,
        movieRating: movieRatingCtrl.value,
        movieUrl: movieUrlCtrl.value,
        movieDesc: movieDescCtrl.value
    }
    try{
       let res = await makeApiCall("POST",moviesurl,movieObj);
    //    console.log(res);
       movieObj.id = res.name;
       createMovie(movieObj);
       Swal.fire({
        title: `${movieObj.movieTitle} movie added successfully`,
        icon: "success",
        timer: 3000
    })
    }
    catch(err){
        console.log(err);
    }
    finally{
        hideLoader();
        movieForm.reset();
    }
}

const updateCard = (res) => {
    let col = [...document.getElementById(res.id).children];
    let card = [...col[0].children];
  //   console.log(card);
     card[0].innerHTML = `<h5 class="m-0 d-flex justify-content-between">
                             ${res.movieTitle}
                                  <small>Rating: ${res.movieRating}/5</small>
                              </h5>`;
     card[1].innerHTML = `<figure>
                              <img src="${res.movieUrl}" class="img-fluid" alt="movieImg" title="movieImg">
                              <figcaption>
                                  <p class="mt-2">${res.movieDesc}</p>
                              </figcaption>
                          </figure>`;
}

const updateMovie = async () => {
    let updateId = localStorage.getItem("editId");
    let updateObj = {
        movieTitle: movieTitleCtrl.value,
        movieRating: movieRatingCtrl.value,
        movieUrl: movieUrlCtrl.value,
        movieDesc: movieDescCtrl.value,
        id: updateId 
    }
    let updateUrl = `${baseUrl}/movies/${updateId}.json`;
    localStorage.removeItem("editId");
    try{
      let res = await makeApiCall("PATCH",updateUrl,updateObj);
      console.log(res);
      updateCard(res);
        Swal.fire({
            title: `${res.movieTitle} movie updated successfully`,
            icon: "success",
            timer: 3000
        })                                              
    }
    catch(err){
        console.log(err);
    }
    finally{
        hideLoader();
        submitBtn.classList.remove("d-none");
        updateBtn.classList.add("d-none");
        movieForm.reset();
    }
}

movieForm.addEventListener("submit",submitMovie);
updateBtn.addEventListener("click",updateMovie);