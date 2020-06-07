<script>
    import { Router, Link, Route } from "svelte-routing";
    import Ranobe from "./profileliteratur.svelte";
</script>
<body class="mt-20 font-sans antialiased text-gray-900 leading-normal tracking-wider bg-cover" style="background-image:url('https://i.ibb.co/NnJ4qn2/DFqzjt4-S66-CPV6-IHiy-Fz-CDNIRQKPFu-UDSvzn-Wp-Jdp-Q.png');">
<nav class="bg-gray-900 pt-2 md:pt-1 pb-1 px-1 mt-0 h-auto fixed w-full top-0 z-50">
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
                        <div id="myDropdown" class="dropdownlist absolute bg-gray-900 text-white right-0 mt-3 p-3 overflow-auto invisible">
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
<div class="pl-10 pr-10 bg-red-900 flex flex-wrap items-center fixed w-full bottom-0 md:bottom-auto z-50 md:z-40">
    <div class="flex w-full content-center justify-between md:justify-end0">
        <ul class="list-reset flex justify-between flex-1">
            <li class="flex-1 md:flex-none md:mr-3 ">
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
<div class="w-full max-w-xs mx-auto content-end mt-4">
    <div class="">
        <div class="flex justify-center">
            <img src="https://i.ibb.co/ZNqNwsL/302564114176201.png" class="w-32 h-32 rounded-full border-solid border-white border-2 mt-32 ">
        </div>
        <h1 class="ml-24 font-bold text-3xl text-black">Shruken</h1>
    </div>
</div>
<div class="bg-white">
        <div class="p-6 mb-16 sm:mb-0 bg-white md:bg-transparent">
            <div class="container mx-auto w-full flex flex-wrap justify-between mx-2 bg-white p-2 md:px-20 block">
                <h1 class="text-black w-full border border-transparent mb-2 pl-2 font-bold bg-gray-300 border-2 border-gray-500 ">Список японских литератур</h1>
                <input type="text" class="w-full bg-white text-sm text-black transition border border-transparent focus:outline-none
                    focus:border-gray-700 rounded py-1 px-2 pl-2 appearance-none leading-normal border-2 border-gray-300" placeholder="Поиск по названию" id="myInput_1" onkeyup="filterDD1('myDropdown_1','myDropdown_2','myDropdown_3','myInput_1')">
                <div class="h-8 w-full "></div>
                <ul class="w-full ">
                    <li class="toggleable_1 text-blue-500 ">
                        <div class="w-full border border-transparent border-gray-500 bg-gray-300">
                            <h3 class="ml-4 text-black font-bold text-2x1">Запланировано</h3>
                        </div>
                            <div class="w-full">
                                <div class="container mx-auto w-full flex flex-wrap justify-between mx-2 mt-10">
                                    <div class="border-b border-b-2 grid md:grid-cols-12 grid-cols-2 w-full font-bold">
                                        <div class="grid col-start-1 md:col-end-10 col-end-9 grid-cols-12">
                                            <div class="ml-4">
                                                    <span class="сursor-default font-bold text-black">
                                                    #
                                                    </span>
                                            </div>
                                            <div class="md:col-start-2 col-start-3 col-end-12 text-indigo-700">
                                                    <span class="cursor-default font-bold text-black">
                                                        Название
                                                    </span>
                                            </div>
                                        </div>
                                        <div class="col-start-10 col-end-13 md:grid grid-cols-2 hidden">
                                            <div class="cursor-default font-bold text-black">
                                                    <span>
                                                    Оценка
                                                    </span>
                                            </div>
                                            <div class="cursor-default font-bold text-black">
                                                    <span>
                                                    Страницы
                                                    </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div id="myDropdown_1">
                                        <a>
                                            <Ranobe />
                                        </a>
                                        <a>
                                            <Ranobe />
                                        </a>
                                        <a>
                                            <Ranobe />
                                        </a>
                                        <a>
                                            <Ranobe />
                                        </a>
                                        <a>
                                            <Ranobe />
                                        </a>
                                        <a>
                                            <Ranobe />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        <div class="h-8 bg-white"></div>
                        <div class="w-full border border-transparent border-gray-500 bg-gray-300">
                            <h3 class="ml-4 text-black font-bold text-2x1">Хочу читать</h3>
                        </div>
                        <div class="w-full">
                            <div class="container mx-auto w-full flex flex-wrap justify-between mx-2 mt-10">
                                <div class="border-b border-b-2 grid md:grid-cols-12 grid-cols-2 w-full font-bold">
                                    <div class="grid col-start-1 md:col-end-10 col-end-9 grid-cols-12">
                                        <div class="ml-4">
                                                    <span class="сursor-default font-bold text-black">
                                                    #
                                                    </span>
                                        </div>
                                        <div class="md:col-start-2 col-start-3 col-end-12 text-indigo-700">
                                                    <span class="cursor-default font-bold text-black">
                                                        Название
                                                    </span>
                                        </div>
                                    </div>
                                    <div class="col-start-10 col-end-13 md:grid grid-cols-2 hidden">
                                        <div class="cursor-default font-bold text-black">
                                                    <span>
                                                    Оценка
                                                    </span>
                                        </div>
                                        <div class="cursor-default font-bold text-black">
                                                    <span>
                                                    Страницы
                                                    </span>
                                        </div>
                                    </div>
                                </div>
                                <div id="myDropdown_2">
                                    <a>
                                        <Ranobe />
                                    </a>
                                    <a>
                                        <Ranobe />
                                    </a>
                                    <a>
                                        <Ranobe />
                                    </a>
                                    <a>
                                        <Ranobe />
                                    </a>
                                    <a>
                                        <Ranobe />
                                    </a>
                                    <a>
                                        <Ranobe />
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div class="h-8 bg-white"></div>
                        <div class="w-full border border-transparent border-gray-500 bg-gray-300">
                            <h3 class="ml-4 text-black font-bold text-2x1">Прочитано</h3>
                        </div>
                        <div class="w-full">
                            <div class="container mx-auto w-full flex flex-wrap justify-between mx-2 mt-10">
                                <div class="border-b border-b-2 grid md:grid-cols-12 grid-cols-2 w-full font-bold">
                                    <div class="grid col-start-1 md:col-end-10 col-end-9 grid-cols-12">
                                        <div class="ml-4">
                                                    <span class="сursor-default font-bold text-black">
                                                    #
                                                    </span>
                                        </div>
                                        <div class="md:col-start-2 col-start-3 col-end-12 text-indigo-700">
                                                    <span class="cursor-default font-bold text-black">
                                                        Название
                                                    </span>
                                        </div>
                                    </div>
                                    <div class="col-start-10 col-end-13 md:grid grid-cols-2 hidden">
                                        <div class="cursor-default font-bold text-black">
                                                    <span>
                                                    Оценка
                                                    </span>
                                        </div>
                                        <div class="cursor-default font-bold text-black">
                                                    <span>
                                                    Страницы
                                                    </span>
                                        </div>
                                    </div>
                                </div>
                                <div id="myDropdown_3">
                                    <a>
                                        <Ranobe />
                                    </a>
                                    <a>
                                        <Ranobe />
                                    </a>
                                    <a>
                                        <Ranobe />
                                    </a>
                                    <a>
                                        <Ranobe />
                                    </a>
                                    <a>
                                        <Ranobe />
                                    </a>
                                    <a>
                                        <Ranobe />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
</div>
<script>
    /*Toggle dropdown list*/
    function toggleD(myDropMen) {
        document.getElementById(myDropMen).classList.toggle("invisible");
    }
    /*Filter dropdown options*/
    function filterD(myDropMen, myDropMenuSearc) {
        var input, filter, ul, li, a, i;
        input = document.getElementById(myDropMenuSearc);
        filter = input.value.toUpperCase();
        div = document.getElementById(myDropMen);
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
        if (!event.target.matches('.drop-butto') && !event.target.matches('.drop-searc')) {
            var dropdowns = document.getElementsByClassName("dropdownlis");
            for (var i = 0; i < dropdowns.length; i++) {
                var openDropdown = dropdowns[i];
                if (!openDropdown.classList.contains('invisible')) {
                    openDropdown.classList.add('invisible');
                }
            }
        }
    }
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


    function filterDD1(myDropMenu_1,myDropMenu_2,myDropMenu_3, myDropMenuSearch_1) {
        var input, filter_1, filter_2, filter_3, ul, li, a, i,b,c;
        input = document.getElementById(myDropMenuSearch_1);
        filter_1 = input.value.toUpperCase();
        filter_2 = input.value.toUpperCase();
        filter_3 = input.value.toUpperCase();
        div = document.getElementById(myDropMenu_1);
        div1 = document.getElementById(myDropMenu_2);
        div2 = document.getElementById(myDropMenu_3);
        a = div.getElementsByTagName("a");
        b = div1.getElementsByTagName("a");
        c = div2.getElementsByTagName("a");
        for (i = 0; i < a.length; i++) {
            if (a[i].innerHTML.toUpperCase().indexOf(filter_1) > -1) {
                a[i].style.display = "";
            } else {
                a[i].style.display = "none";
            }
            if (b[i].innerHTML.toUpperCase().indexOf(filter_2) > -1) {
                b[i].style.display = "";
            } else {
                b[i].style.display = "none";
            }
            if (c[i].innerHTML.toUpperCase().indexOf(filter_3) > -1) {
                c[i].style.display = "";
            } else {
                c[i].style.display = "none";
            }
        }
    }
    window.onclick = function(event) {
        if (!event.target.matches('.drop-button_1') && !event.target.matches('.drop-search_1')) {
            var dropdowns = document.getElementsByClassName("dropdownlist_1");
            for (var i = 0; i < dropdowns.length; i++) {
                var openDropdown = dropdowns[i];
                if (!openDropdown.classList.contains('visible')) {
                    openDropdown.classList.add('visible');
                }
            }
        }
    }
</script>
<style>
    .mega-menu_9 {
        display: none;
        left: 0;
        position: absolute;
        text-align: left;
        width: 100%;
    }
    .toggle-input_9 {
        display: none;
    }
    .toggle-input_9:not(checked) ~ .mega-menu_9 {
        display: none;
    }
    .toggleable_9 > label:after
    {
        content: "\25BC";
        font-size: 10px;
        padding-left: 6px;
        position: relative;
        top: -1px;
    }
    .toggle-input_9:checked ~ .mega-menu_9 {
        display: block;
    }
    .toggle-input_9:checked ~ label:after {
        content: "\25B2";
        font-size: 10px;
        padding-left: 6px;
        position: relative;
        top: -1px;
    }
    .mega-menu_8 {
        display: none;
        left: 0;
        position: absolute;
        text-align: left;
        width: 100%;
    }
    .toggle-input_8 {
        display: none;
    }
    .toggle-input_8:not(checked) ~ .mega-menu_8 {
        display: none;
    }
    .toggleable_8 > label:after
    {
        content: "\25BC";
        font-size: 10px;
        padding-left: 6px;
        position: relative;
        top: -1px;
    }
    .toggle-input_8:checked ~ .mega-menu_8 {
        display: block;
    }
    .toggle-input_8:checked ~ label:after {
        content: "\25B2";
        font-size: 10px;
        padding-left: 6px;
        position: relative;
        top: -1px;
    }
    .mega-menu_7 {
        display: none;
        left: 0;
        position: absolute;
        text-align: left;
        width: 100%;
    }
    .toggle-input_7 {
        display: none;
    }
    .toggle-input_7:not(checked) ~ .mega-menu_7 {
        display: none;
    }
    .toggleable_7 > label:after
    {
        content: "\25BC";
        font-size: 10px;
        padding-left: 6px;
        position: relative;
        top: -1px;
    }
    .toggle-input_7:checked ~ .mega-menu_7 {
        display: block;
    }
    .toggle-input_7:checked ~ label:after {
        content: "\25B2";
        font-size: 10px;
        padding-left: 6px;
        position: relative;
        top: -1px;
    }
    .mega-menu_6 {
        display: none;
        left: 0;
        position: absolute;
        text-align: left;
        width: 100%;
    }
    .toggle-input_6 {
        display: none;
    }
    .toggle-input_6:not(checked) ~ .mega-menu_6 {
        display: none;
    }
    .toggleable_6 > label:after
    {
        content: "\25BC";
        font-size: 10px;
        padding-left: 6px;
        position: relative;
        top: -1px;
    }
    .toggle-input_6:checked ~ .mega-menu_6 {
        display: block;
    }
    .toggle-input_6:checked ~ label:after {
        content: "\25B2";
        font-size: 10px;
        padding-left: 6px;
        position: relative;
        top: -1px;
    }
    .mega-menu_5 {
        display: none;
        left: 0;
        position: absolute;
        text-align: left;
        width: 100%;
    }
    .toggle-input_5 {
        display: none;
    }
    .toggle-input_5:not(checked) ~ .mega-menu_5 {
        display: none;
    }
    .toggleable_5 > label:after
    {
        content: "\25BC";
        font-size: 10px;
        padding-left: 6px;
        position: relative;
        top: -1px;
    }
    .toggle-input_5:checked ~ .mega-menu_5 {
        display: block;
    }
    .toggle-input_5:checked ~ label:after {
        content: "\25B2";
        font-size: 10px;
        padding-left: 6px;
        position: relative;
        top: -1px;
    }
    .mega-menu_4 {
        display: none;
        left: 0;
        position: absolute;
        text-align: left;
        width: 100%;
    }
    .toggle-input_4 {
        display: none;
    }
    .toggle-input_4:not(checked) ~ .mega-menu_4 {
        display: none;
    }
    .toggleable_4 > label:after
    {
        content: "\25BC";
        font-size: 10px;
        padding-left: 6px;
        position: relative;
        top: -1px;
    }
    .toggle-input_4:checked ~ .mega-menu_4 {
        display: block;
    }
    .toggle-input_4:checked ~ label:after {
        content: "\25B2";
        font-size: 10px;
        padding-left: 6px;
        position: relative;
        top: -1px;
    }
    .mega-menu_3 {
        display: none;
        left: 0;
        position: absolute;
        text-align: left;
        width: 100%;
    }
    .toggle-input_3 {
        display: none;
    }
    .toggle-input_3:not(checked) ~ .mega-menu_3 {
        display: none;
    }
    .toggleable_3 > label:after
    {
        content: "\25BC";
        font-size: 10px;
        padding-left: 6px;
        position: relative;
        top: -1px;
    }
    .toggle-input_3:checked ~ .mega-menu_3 {
        display: block;
    }
    .toggle-input_3:checked ~ label:after {
        content: "\25B2";
        font-size: 10px;
        padding-left: 6px;
        position: relative;
        top: -1px;
    }
    .mega-menu_2 {
        display: none;
        left: 0;
        position: absolute;
        text-align: left;
        width: 100%;
    }
    .toggleable_2  > label:after {
        content: "\25BC";
        font-size: 10px;
        padding-left: 6px;
        position: relative;
        top: -1px;
    }

    .toggle-input_2 {
        display: none;
    }
    .toggle-input_2:not(checked) ~ .mega-menu_2 {
        display: none;
    }

    .toggle-input_2:checked ~ .mega-menu_2 {
        display: block;
    }
    .toggle-input_2:checked ~ label:after {
        content: "\25B2";
        font-size: 10px;
        padding-left: 6px;
        position: relative;
        top: -1px;
    }

    .mega-menu_1 {
        display: none;
        left: 0;
        position: absolute;
        text-align: left;
        width: 100%;
    }
    .toggleable_1 > label:after
    {
        content: "\25BC";
        font-size: 10px;
        padding-left: 6px;
        position: relative;
        top: -1px;
    }
    .toggle-input_1 {
        display: none;
    }
    .toggle-input_1:not(checked) ~ .mega-menu_1 {
        display: none;
    }

    .toggle-input_1:checked ~ .mega-menu_1 {
        display: block;
    }
    .toggle-input_1:checked ~ label:after {
        content: "\25B2";
        font-size: 10px;
        padding-left: 6px;
        position: relative;
        top: -1px;
    }

    .mega-menu {
        display: none;
        left: 0;
        position: absolute;
        text-align: left;
        width: 100%;
    }
    .toggleable  > label:after {
        content: "\25BC";
        font-size: 10px;
        padding-left: 6px;
        position: relative;
        top: -1px;
    }

    .toggle-input {
        display: none;
    }
    .toggle-input:not(checked) ~ .mega-menu {
        display: none;
    }

    .toggle-input:checked ~ .mega-menu {
        display: block;
    }
    .toggle-input:checked ~ label:after {
        content: "\25B2";
        font-size: 10px;
        padding-left: 6px;
        position: relative;
        top: -1px;
    }
     input[type="number"]::-webkit-outer-spin-button,
     input[type="number"]::-webkit-inner-spin-button {
         -webkit-appearance: none;
     }
    input[type=number]::-webkit-inner-spin-button,
    input[type=number]::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
</style>
</body>