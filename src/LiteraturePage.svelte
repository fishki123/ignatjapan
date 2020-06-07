<script>
    import { Router, Link, Route } from "svelte-routing";
</script>

<body class="mt-20 font-sans antialiased text-gray-900 leading-normal tracking-wider bg-cover">
<nav class="bg-gray-900 pt-2 md:pt-1 pb-1 px-1 mt-0 h-auto fixed w-full z-20 top-0 ">
    <div class="flex flex-wrap items-center">
        <div class="flex flex-shrink md:w-1/3 justify-center md:justify-start text-white">
            <Link to="/">
                <a href="#">
                    <img  class="object-left-top bg-gray-400 w-20 h-20" src="https://i.ibb.co/1n212y8/Ignat-Japan.jpg" alt="Ignat-Japan" border="0">
                </a>
            </Link>
        </div>
        <div class="flex flex-1 w-full justify-center md:justify-start text-white px-2 mr-0 md:mr-20">
                            <span class="relative w-full">
                        <input type="search" placeholder="Search" class="w-full bg-gray-800 text-sm text-white transition border border-transparent focus:outline-none focus:border-gray-700 rounded py-1 px-2 pl-10 appearance-none leading-normal">
                        <div class="absolute search-icon" style="top: .5rem; left: .8rem;">
                            <svg class="fill-current pointer-events-none text-white w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M12.9 14.32a8 8 0 1 1 1.41-1.41l5.35 5.33-1.42 1.42-5.33-5.34zM8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12z"></path>
                            </svg>
                        </div>
                </span>
        </div>
        <div class="flex w-full pt-2 content-center justify-between md:w-1/3 md:justify-end">
            <ul class="pr-1">
                <li class="flex-none md:mr-3">
                    <div class="relative inline-block">
                        <p class="text-white">
                            <Link to="Register">
                                <a href="#"><span class="text-white underline">Регистрация</span></a>
                            </Link>
                        </p>
                    </div>
                </li>
                <li class="flex-none md:mr-3">
                    <div class="relative inline-block">
                        <p class="text-white">
                            <Link to="Login">
                                <a href="#"><span class="text-white underline ml-6">Войти</span></a>
                            </Link>
                        </p>
                    </div>
                </li>
            </ul>
            <ul class="list-reset flex justify-between flex-1 md:flex-none items-center">
                <li class="flex-1 md:flex-none md:mr-3 text-right">
                    <div class="relative inline-block">
                        <button onclick="toggleDD('myDropdown')" class="drop-button text-white focus:outline-none"> <span class="pr-2"><i class="fa fa-user"></i></span> Привет, пользователь <svg class="h-3 fill-current inline" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg></button>
                        <div id="myDropdown" class="dropdownlist absolute bg-gray-900 text-white right-0 mt-3 p-3 overflow-auto z-30 invisible">
                            <input type="text" class="drop-search p-2 text-gray-600" placeholder="Search.." id="myInput" onkeyup="filterDD('myDropdown','myInput')">
                            <Link to="Mainprofile">
                                <a href="/" class="p-2 hover:bg-gray-800 text-white text-sm no-underline hover:no-underline block text-center"><i class="fa fa-user fa-fw"></i>Profile</a>
                            </Link>
                            <a href="#" class="p-2 hover:bg-gray-800 text-white text-sm no-underline hover:no-underline block text-center"><i class="fa fa-cog fa-fw"></i> Settings</a>
                            <div class="border border-gray-800"></div>
                            <a href="#" class="p-2 hover:bg-gray-800 text-white text-sm no-underline hover:no-underline block text-center"><i class="fas fa-sign-out-alt fa-fw"></i> Log Out</a>
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</nav>
<div class="pl-10 pr-10 bg-red-900 flex flex-wrap items-center fixed w-full bottom-0 md:bottom-auto">
    <div class="flex w-full content-center justify-between md:justify-end">
        <ul class="list-reset flex justify-between flex-1">
            <li class="flex-1 md:flex-none md:mr-3">
                <Link to="/">
                    <a href="/" class="block py-1 md:py-3 pl-1 align-middle text-white no-underline hover:text-white hover:border-pink-500">
                        <i class="fas fa-home pr-0 ml-4 md:ml-0 md:pr-3"></i><span class="pb-1 md:pb-0 text-xs md:text-base  md:text-white block md:inline-block">Главное меню</span>
                    </a>
                </Link>
            </li>
            <li class="flex-1 md:flex-none md:mr-3">
                <Link to="Japanliterature">
                    <a href="/" class="block py-1 md:py-3 pl-1 align-middle text-white no-underline hover:text-white hover:border-purple-500">
                        <i class="fa fa-book pr-0 md:pr-3 ml-6 md:ml-0"></i><span class="pb-1 md:pb-0 text-xs md:text-base  md:text-white block md:inline-block">Японская литература</span>
                    </a>
                </Link>
            </li>
            <li class="flex-1 md:flex-none md:mr-3">
                <a href="#" class="block py-1 md:py-3 pl-1 align-middle text-white no-underline hover:text-white hover:border-purple-500">
                    <i class="fas fa-chart-area pr-0 ml-4 md:pr-3"></i><span class="pb-1 md:pb-0 text-xs md:text-base text-white md:text-white block md:inline-block">Analytics</span>
                </a>
            </li>
        </ul>
    </div>
</div>
<div class="bg-gray-300 h-20 md:h-16 w-full"></div>
<div class="flex-1 bg-gray-300 p-1 md:p-4">
    <div class="bg-gray-100 border-2 border-black p-4 h-full md:h-full rounded-lg shadow-lg">
        <div class=""><h3 class="text-3xl text-white font-bold leading-none mb-3 text-center bg-red-900 rounded-lg shadow-lg">Название</h3></div>
        <div class="flex flex-row mb-4">
            <div class=" bg-gray-600 w-64 h-64"></div>
            <div class="w-full sm:w-1/1">
                <div class="ml-4"><p class="text-gray-600 mb-8 ">Автор:</p></div>
                <div class="ml-4"><p class="text-gray-600 mb-8 ">Жанр:</p></div>
                <div class="ml-4"><p class="text-gray-600 mb-8 ">Год:</p></div>
                <div class="ml-4"><p class="text-gray-600 mb-8 ">Метки:</p></div>
            </div>
        </div>
        <div class=""><h3 class="text-3xl text-white font-bold leading-none mb-3 text-center bg-red-900 rounded-lg shadow-lg">Описание</h3></div>
        <div class="">
            <p class="leading-normal slide-in-bottom-subtitle">Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-то
                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-то
                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-то
                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т
                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т
                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т
                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т
                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т
                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т
                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т
                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т
                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т
                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т
                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т
                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т
                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т
                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т
                Что-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-т</p>
        </div>
    </div>
</div>
    <div class="flex-1 bg-gray-300 p-1 md:p-4">
        <div class="bg-gray-100 border-2 border-black h-full md:h-full w-full rounded-lg shadow-lg">
            <div class="mt-1 mb-1 ml-4 md:ml-4">Новый комментарий:</div>
            <div class="w-full md:flex-row md:flex">
                <div class="">
                    <div class="bg-gray-600 w-32 h-32 ml-4 ">
                        <i class="fas fa-user fa-7x ml-4 mt-2"></i>
                    </div>
                    <div class="ml-16 mt-1 ">Имя</div>
                </div>
                <div class="w-full">
                    <div class="flex flex-row">
                        <input type="text" placeholder="Оставьте комментарий" class=" w-full ml-4 mr-2 bg-gray-100 border-2 border-gray-500 p-0 md:p-2 h-32 w-auto rounded-lg shadow-lg text-sm text-black transition border border-transparent focus:outline-none focus:border-gray-700 appearance-none leading-normal">
                    </div>
                    <div class="flex flex-row ml-4">
                        <p class="mt-1">
                            Чтобы написать комментарии,
                            <Link to="Register">
                                <a href="#"><span class="underline">зарегистрируйтесь</span></a>
                            </Link>
                            или
                            <Link to="Login">
                                <a href="#"><span class="underline">войдите</span></a>
                            </Link>
                        </p>
                    </div>
                    <div class="mr-2 mt-2 md:mt-2 text-right">
                        <button class="w-auto mb-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
                            Отправить
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
<div class="flex-1 bg-gray-300 p-1 md:p-4">
    <div class="bg-gray-100 border-2 border-black p-4 h-full md:h-full rounded-lg shadow-lg">
        <div class="w-full flex flex-row">
            <div class="mt-6">
                <div class="bg-gray-600 w-32 h-32">
                    <i class="fas fa-user fa-7x ml-4 mt-2"></i>
                </div>
            </div>
            <div class="w-full">
                <div class="flex flex-row">
                    <p class="md:-ml-32 -ml-32">Имя,</p>
                    <p class="ml-8 md:ml-8">Дата,</p>
                    <p class="ml-8 md:ml-8">Время</p>
                </div>
                <div class="w-full ml-2 md:ml-2 mr-0 md:mr-2 bg-gray-100 border-2 border-gray-500 p-2 h-32 w-auto rounded-lg shadow-lg text-sm text-black transition border border-transparent focus:outline-none focus:border-gray-700 appearance-none leading-normal">
                    <p>то-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-тоЧто-то</p>
                </div>
            </div>
        </div>
    </div>
</div>
<div class="h-20 md:h-12 w-full bg-gray-300"></div>
<script>
    /*Toggle dropdown list*/
    function toggleDD(myDropMenu) {
        document.getElementById(myDropMenu).classList.toggle("invisible");
    }
    /*Filter dropdown options*/
    function filterDD(myDropMenu, myDropMenuSearch) {
        var input, filter, ul, li, a, i;
        input = document.getElementById(myDropMenuSearch);
        filter = input.value.toUpperCase();
        div = document.getElementById(myDropMenu);
        a = div.getElementsByTagName("a");
        for (i = 0; i < a.length; i++) {
            if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
                a[i].style.display = "";
            } else {
                a[i].style.display = "none";
            }
        }
    }
    // Close the dropdown menu if the user clicks outside of it
    window.onclick = function(event) {
        if (!event.target.matches('.drop-button') && !event.target.matches('.drop-search')) {
            var dropdowns = document.getElementsByClassName("dropdownlist");
            for (var i = 0; i < dropdowns.length; i++) {
                var openDropdown = dropdowns[i];
                if (!openDropdown.classList.contains('invisible')) {
                    openDropdown.classList.add('invisible');
                }
            }
        }
    }
</script>
</body>