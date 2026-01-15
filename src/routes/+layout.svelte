<script>
import '../app.css';
import { ModeWatcher } from 'mode-watcher';

let { children } = $props();
</script>

<ModeWatcher />

<div class="min-h-screen bg-background">
	{@render children()}
</div>
