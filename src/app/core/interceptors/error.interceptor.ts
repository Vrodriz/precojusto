import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let userMessage = 'Ocorreu um erro inesperado.';

        if (!navigator.onLine) {
          userMessage = 'Sem conexão com a internet. Verifique sua rede.';
        } else if (error.status === 0) {
          userMessage = 'Falha de conexão com o servidor.';
        } else if (error.status === 400) {
          userMessage = 'Requisição inválida (400).';
        } else if (error.status === 401) {
          userMessage = 'Não autorizado. Faça login novamente.';
        } else if (error.status === 403) {
          userMessage = 'Acesso negado.';
        } else if (error.status === 404) {
          userMessage = 'Recurso não encontrado (404).';
        } else if (error.status === 500) {
          userMessage = 'Erro interno do servidor (500).';
        }

        console.error('Erro HTTP interceptado:', error);

        alert(userMessage);

        return throwError(() => error);
      })
    );
  }
}
