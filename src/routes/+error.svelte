<script lang="ts">
    import { page } from '$app/stores';
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
        <div>
            <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
                {$page.status + " " + ($page.error ? $page.error.message : "Error")}
            </h2>
        </div>
        <div>
            <p class="text-center text-sm text-gray-600">
                Something unexpected happened.
            </p>
        </div>
        <div>
            <a
                href="/"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                Go back home
            </a>
        </div>
    </div>
</div>