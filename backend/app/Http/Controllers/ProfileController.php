<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\UserResource;

class ProfileController extends Controller
{
    public function update(UpdateProfileRequest $request): UserResource
    {
        $user = $request->user();
        $user->update($request->validated());

        return new UserResource($user->refresh());
    }
}
