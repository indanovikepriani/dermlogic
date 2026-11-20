<?php

namespace App\Http\Controllers;

class DermLogicController extends Controller
{
    public function index()
    {
        return view('dermlogic.index');
    }

    public function referensi()
    {
        return view('dermlogic.referensi');
    }

    public function pengetahuan()
    {
        return view('dermlogic.pengetahuan');
    }
}
