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
  apiStatus: 'initializing' | 'connected' | 'not-found' = 'initializing';
  segmentValue: 'cep' | 'endereco' = 'cep';

  private gifs: string[] = [
    'https://iili.io/KCCtaYx.th.gif',
    'https://iili.io/KCCDWtS.th.gif',
    'https://iili.io/KCC0KLx.th.gif',
    'https://iili.io/KCCCRcl.th.gif'
  ];

  constructor() {
    this.checkApiStatus();
    (window as any).meu_callback = (conteudo: ViaCepResponse | ViaCepResponse[]) => {
      this.loading.dismiss();
      if (Array.isArray(conteudo)) {
        if (conteudo.length > 0 && !conteudo[0].erro) {
          const firstResult = conteudo[0];
          this.Logradouro = firstResult.logradouro;
          this.Cidade = firstResult.localidade;
          this.Bairro = firstResult.bairro;
          this.Estado = firstResult.uf;
          this.conteudo = firstResult;
          this.apiStatus = 'connected';
        } else {
          this.apiStatus = 'not-found';
          alert('Endereço não encontrado.');
        }
      } else {
        if (!conteudo.erro) {
          this.Logradouro = conteudo.logradouro;
          this.Cidade = conteudo.localidade;
          this.Bairro = conteudo.bairro;
          this.Estado = conteudo.uf;
          this.conteudo = conteudo;
          this.apiStatus = 'connected';
        } else {
          this.apiStatus = 'not-found';
          alert('CEP não encontrado.');
        }
      }
    };
  }

  async checkApiStatus() {
    try {
      const response = await fetch('https://viacep.com.br/ws/01001000/json/');
      if (response.ok) {
        this.apiStatus = 'connected';
      } else {
        this.apiStatus = 'not-found';
      }
    } catch {
      this.apiStatus = 'not-found';
    }
  }

  async searchCep() {
    this.apiStatus = 'initializing';
    await this.loading.present();
    this.resgate();
  }

  async onLoadingDismiss() {
    if (this.conteudo && !this.conteudo.erro) {
      this.randomGif = this.gifs[Math.floor(Math.random() * this.gifs.length)];
      await this.modal.present();
    }
  }


  onSegmentChange(event: any) {
    this.segmentValue = event.detail.value;
    this.valor = '';
    this.conteudo = undefined;
    this.Logradouro = '';
    this.Cidade = '';
    this.Bairro = '';
    this.Estado = '';
  }

  setTestCep(cep: string) {
    this.valor = cep;
  }

  resgate() {
    if (this.segmentValue === 'cep') {
      const cep = this.valor.replace(/\D/g, '');
      if (cep !== '') {
        const validacep = /^[0-9]{8}$/;
        if (validacep.test(cep)) {
          const script = document.createElement('script');
          script.src = `https://viacep.com.br/ws/${cep}/json/?callback=meu_callback`;
          document.body.appendChild(script);
        } else {
          this.apiStatus = 'not-found';
          alert('Formato de CEP inválido.');
          this.loading.dismiss();
        }
      } else {
        this.apiStatus = 'not-found';
        alert('Por favor, insira um CEP.');
        this.loading.dismiss();
      }
    } else {
      const gamb = this.Estado + ',' + this.Cidade + ',' + this.Logradouro;
      const endereco = gamb.trim();
    const cep = '';
      if (endereco !== '') {
        const partes = endereco.split(',').map(part => part.trim());
        if (partes.length >= 3) {
          const uf = encodeURIComponent(partes[0].toUpperCase());
          const cidade = encodeURIComponent(partes[1]);
          const rua = encodeURIComponent(partes[2]);
          const script = document.createElement('script');
          script.src = `https://viacep.com.br/ws/${uf}/${cidade}/${rua}/${cep}json/?callback=meu_callback`;
          document.body.appendChild(script);
          console.log(script);
        } else {
          this.apiStatus = 'not-found';
          alert('Formato de endereço inválido. Use: Rua, Cidade, UF');
          this.loading.dismiss();
        }
      } else {
        this.apiStatus = 'not-found';
        alert('Por favor, insira um endereço.');
        this.loading.dismiss();
      }
    }
  }

  async exit() {
    await this.modal.dismiss();
  }
  resgateEnd() {
  const Estado = this.Estado;
  const Cidade = this.Cidade;
  const Rua = this.Logradouro;

  const script = document.createElement('script');
  script.src = `https://viacep.com.br/ws/${Estado}/${Cidade}/${Rua}/json/?callback=meu_callback`;
  document.body.appendChild(script);
}

}
