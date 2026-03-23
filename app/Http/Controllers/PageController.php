<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class PageController extends Controller
{
    protected array $pages = [
        'privacy',
        'terms',
        'imprint',
        'widget',
    ];

    public function show(string $slug): Response
    {
        if (!in_array($slug, $this->pages)) {
            throw new NotFoundHttpException();
        }

        $page = ucfirst($slug);

        return Inertia::render("Pages/{$page}");
    }
}
