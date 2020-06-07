<script>
	import { Router, Link, Route } from "svelte-routing";
	import Tailwindcss from './Tailwindcss.svelte';
	import Mainmenu from './Mainmenu.svelte';
	import Japanliterature from "./Japanliterature.svelte";
	import Literaturepage from  "./LiteraturePage.svelte";
	import Register from  "./Register.svelte";
	import Login from  "./Login.svelte";
	import Mainprofile from  "./mainprofile.svelte";
	export let url = "";
</script>
<Tailwindcss />
<main>
	<Router url="{url}">
		<div>
			<Route path="Japanliterature" component="{Japanliterature}" />
			<Route path="Register" component="{Register}" />
			<Route path="Login" component="{Login}" />
			<Route path="Mainprofile" component="{Mainprofile}" />
			<Route path="Literaturepage" component="{Literaturepage}"></Route>
			<Route path="/" component="{Mainmenu}"></Route>
		</div>
	</Router>
</main>
