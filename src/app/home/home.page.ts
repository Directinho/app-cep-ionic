import { Component, ViewChild } from '@angular/core';
import { IonLoading, IonModal } from '@ionic/angular';

interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  @ViewChild('loading') loading!: IonLoading;
  @ViewChild('modal') modal!: IonModal;

  Logradouro = '';
  Cidade = '';
  Estado = '';
  Bairro = '';
  conteudo: ViaCepResponse | undefined;
  valor = '';
  randomGif: string = '';

  private gifs: string[] = [
    'https://iili.io/KCCtaYx.th.gif',
    'https://iili.io/KCCDWtS.th.gif',
    'https://iili.io/KCC0KLx.th.gif',
    'https://iili.io/KCCCRcl.th.gif'
  ];

  constructor() {
    (window as any).meu_callback = (conteudo: ViaCepResponse) => {
      if (!conteudo.erro) {
        this.Logradouro = conteudo.logradouro;
        this.Cidade = conteudo.localidade;
        this.Bairro = conteudo.bairro;
        this.Estado = conteudo.uf;
        this.conteudo = conteudo;
      } else {
        alert('CEP não encontrado.');
      }
    };
  }

  async searchCep() {
    await this.loading.present();
    this.resgate();
  }

  async onLoadingDismiss() {
    if (this.conteudo && !this.conteudo.erro) {
      this.randomGif = this.gifs[Math.floor(Math.random() * this.gifs.length)];
      await this.modal.present();
    }
  }

  onInputChange(event: any) {
    this.valor = event.target.value;
  }

  async exit() {
    await this.modal.dismiss();
  }

  setTestCep(cep: string) {
    this.valor = cep;
  }

  resgate() {
    const cep = this.valor.replace(/\D/g, '');
    if (cep !== '') {
      const validacep = /^[0-9]{8}$/;

      if (validacep.test(cep)) {
        const script = document.createElement('script');
        script.src = `https://viacep.com.br/ws/${cep}/json/?callback=meu_callback`;
        document.body.appendChild(script);
      } else {
        alert('Formato de CEP inválido.');
        this.loading.dismiss();
      }
    } else {
      alert('Por favor, insira um CEP.');
      this.loading.dismiss();
    }
  }
}
