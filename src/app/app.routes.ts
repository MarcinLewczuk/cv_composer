import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { BuilderComponent } from './pages/builder/builder.component';
import { InterviewComponent } from './pages/interview/interview.component';
import { TestsComponent } from './pages/tests/tests.component';
import { JobsComponent } from './pages/jobs/jobs.component';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        title: 'Home'
    },
    {
        path: 'builder',
        component: BuilderComponent,
        title: 'CV Builder'
    },
    {
        path: 'jobs',
        component: JobsComponent,
        title: 'Search Jobs'
    },
    {
        path: 'interview',
        component: InterviewComponent,
        title: 'Interview Practice'
    },
    {
        path: 'tests',
        component: TestsComponent,
        title: 'Mock Tests'
    },
    {
        path: 'login',
        component: LoginComponent,
        title: 'Login'
    },
    {
        path: 'signup',
        component: SignupComponent,
        title: 'Signup'
    }
];
