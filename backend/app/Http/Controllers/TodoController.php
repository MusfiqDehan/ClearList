<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTodoRequest;
use App\Http\Requests\UpdateTodoRequest;
use App\Http\Resources\TodoResource;
use App\Models\Todo;
use App\Services\TodoService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class TodoController extends Controller
{
    public function __construct(private readonly TodoService $todos) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $status = $request->string('status', 'all')->toString();
        $search = $request->string('search')->trim()->toString();
        $perPage = min(max($request->integer('per_page', 50), 1), 100);

        $todos = $this->todos->paginate($request->user(), $status, $search, $perPage);

        return TodoResource::collection($todos);
    }

    public function store(StoreTodoRequest $request): TodoResource
    {
        $todo = $this->todos->create($request->user(), $request->validated());

        return new TodoResource($todo);
    }

    public function show(Todo $todo): TodoResource
    {
        $this->authorize('view', $todo);

        return new TodoResource($todo);
    }

    public function update(UpdateTodoRequest $request, Todo $todo): TodoResource
    {
        return new TodoResource($this->todos->update($request->user(), $todo, $request->validated()));
    }

    public function destroy(Request $request, Todo $todo): Response
    {
        $this->todos->delete($request->user(), $todo);

        return response()->noContent();
    }
}
