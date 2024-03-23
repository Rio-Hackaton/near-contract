import { NearBindgen, near, call, view, initialize, UnorderedMap } from 'near-sdk-js';
import { assert } from './utils';

class Property {
  constructor(
    public id: string,
    public type: string,
    public cep: string,
    public latitude: number,
    public longitude: number,
    public imageUrl: string,
    public owner: string
  ) {}
}

@NearBindgen({ requireInit: true })
class RealEstateContract {
  private properties: UnorderedMap<Property> = new UnorderedMap('properties');
  private admin: string = "paulopaula.testnet"; // Campo para armazenar o administrador do contrato

  @initialize({ privateFunction: true })
  init({ admin }: { admin: string }) {
    this.admin = admin;
  }

  @call({})
  addProperty({ type, cep, latitude, longitude, imageUrl }: { type: string; cep: string; latitude: number; longitude: number; imageUrl: string }): string {
    const owner = near.predecessorAccountId();
    const id = `${cep}-${Date.now().toString()}-${owner}`;
    const property = new Property(id, type, cep, latitude, longitude, imageUrl, owner);
    this.properties.set(id, property);
    near.log(`Imóvel adicionado com ID: ${id}`);
    return id;
  }

  @view({})
  getPropertiesByWallet({ walletId }: { walletId: string }): Property[] {
    // Inicialmente, buscaremos todas as chaves sem especificar um ponto de início ou limite,
    // o que é comum quando queremos todas as chaves. Para evitar problemas de desempenho,
    // em um contrato real, você deve implementar paginação ou limites.
    const allKeys = this.properties.keys({ start: 0, limit: 10000 }); // Exemplo usando limites arbitrários para demonstração
    const allProperties: Property[] = [];
  
    for (const key of allKeys) {
      const property = this.properties.get(key);
      if (property && property.owner === walletId) {
        allProperties.push(property);
      }
    }
  
    return allProperties;
  }

  @view({})
  getPropertyById({ id }: { id: string }): Property | null {
    return this.properties.get(id);
  }

  @call({ privateFunction: true })
  changeAdmin({ newAdmin }: { newAdmin: string }) {
    assert(near.predecessorAccountId() === this.admin, "Somente o administrador pode mudar o administrador.");
    this.admin = newAdmin;
  }
}