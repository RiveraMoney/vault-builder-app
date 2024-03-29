import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BigNumber } from 'bignumber.js';
import { getUnixTime, sub } from 'date-fns';
import { ApolloLink, ApolloQueryResult, InMemoryCache } from '@apollo/client';
import { HttpLink } from 'apollo-angular/http'
import { ChainId } from '@pancakeswap/sdk';
interface FarmsResponse {
  farmsAtLatestBlock: {
    id: string;
    volumeUSD: string;
    reserveUSD: string;
  }[];
  farmsOneWeekAgo: {
    id: string;
    volumeUSD: string;
    reserveUSD: string;
  }[];
}

interface AprMap {
  [key: string]: number;
}
@Injectable({
  providedIn: 'root'
})
export class GetAprsForFarmGroupService {
  private readonly LP_HOLDERS_FEE = 0.05;
  private readonly WEEKS_IN_A_YEAR = 52;
  public farmsResponseVlue: any;
  // private link: ApolloLink;
  constructor(private apollo: Apollo, private httpLink: HttpLink) {
    // this.link = httpLink.create({ uri: 'https://bsc.streamingfast.io/subgraphs/name/pancakeswap/exchange-v2' });
    // this.apollo.create({
    //   link: this.link,
    //   cache: new InMemoryCache()
    // });
    //this.resetLink('https://bsc.streamingfast.io/subgraphs/name/pancakeswap/exchange-v2');
  }

  // public getAprsForStableFarm(stableFarm: any): Observable<BigNumber> {

  //   this.apollo.create({
  //     cache: new InMemoryCache(),
  //     link: this.httpLink.create({ uri: 'https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-stableswap' }),
  //   });

  //   const stableSwapAddress = stableFarm?.stableSwapAddress;

  //   const query = gql`
  //     query virtualPriceStableSwap($stableSwapAddress: String, $blockDayAgo: Int!) {
  //       virtualPriceAtLatestBlock: pairs(id: $stableSwapAddress) {
  //         virtualPrice
  //       }
  //       virtualPriceOneDayAgo: pairs(id: $stableSwapAddress, block: { number: $blockDayAgo }) {
  //         virtualPrice
  //       }
  //     }
  //   `;

  //   const dayAgo = sub(new Date(), { days: 1 });

  //   const dayAgoTimestamp = getUnixTime(dayAgo);

  //   return this.apollo
  //     .watchQuery({
  //       query,
  //       variables: {
  //         stableSwapAddress,
  //         blockDayAgo: dayAgoTimestamp,
  //       },
  //     })
  //     .valueChanges.pipe(
  //       map((res: any) => {
  //         const virtualPrice = res.data.virtualPriceAtLatestBlock[0]?.virtualPrice;
  //         const preVirtualPrice = res.data.virtualPriceOneDayAgo[0]?.virtualPrice;

  //         const current = new BigNumber(virtualPrice);
  //         const prev = new BigNumber(preVirtualPrice);

  //         return current.minus(prev).div(prev);
  //       }),
  //     );
  // }

  resetLink(newUri: string) {
    // this.apollo.client.cache.reset();
    // this.httpLink.create({ uri: newUri });

    this.apollo.removeClient();
      this.apollo.create({
        cache: new InMemoryCache(),
        link: this.httpLink.create({ uri: newUri }),
      });
  }

//   async getAprsForFarmGroup(addresses: string[], blockWeekAgo: number, chainId: number): Promise<AprMap> {
//     try {
//
//     this.resetLink('https://bsc.streamingfast.io/subgraphs/name/pancakeswap/exchange-v2');
//       // this.apollo.create({
//       //   cache: new InMemoryCache(),
//       //   link: this.httpLink.create({ uri: 'https://bsc.streamingfast.io/subgraphs/name/pancakeswap/exchange-v2' }),
//       // });

//       var response = await this.apollo.query({
//         query: gql`
//         query farmsBulk($addresses: [String]!, $blockWeekAgo: Int!) {
//           farmsAtLatestBlock: pairs(first: 30, where: { id_in: $addresses }) {
//             id
//             volumeUSD
//             reserveUSD
//           }
//           farmsOneWeekAgo: pairs(first: 30, where: { id_in: $addresses }, block: { number: $blockWeekAgo }) {
//             id
//             volumeUSD
//             reserveUSD
//           }
//         }
//                `,
//                variables: { addresses, blockWeekAgo },
//       }).toPromise();

//       // const response = await this.apollo.query({
//       //   query: gql`
//       //     query farmsBulk($addresses: [String]!, $blockWeekAgo: Int!) {
//       //       farmsAtLatestBlock: pairs(first: 30, where: { id_in: $addresses }) {
//       //         id
//       //         volumeUSD
//       //         reserveUSD
//       //       }
//       //       farmsOneWeekAgo: pairs(first: 30, where: { id_in: $addresses }, block: { number: $blockWeekAgo }) {
//       //         id
//       //         volumeUSD
//       //         reserveUSD
//       //       }
//       //     }
//       //   `,
//       //   variables: { addresses, blockWeekAgo },
//       //   context: {
//       //     headers: {
//       //       'chain-id': chainId.toString()
//       //     }
//       //   }
//       // }).toPromise();
//
//       this.farmsResponseVlue = (response as ApolloQueryResult<FarmsResponse>).data

//       const { farmsAtLatestBlock, farmsOneWeekAgo } =  this.farmsResponseVlue;
//       return farmsAtLatestBlock.reduce((aprMap: any, farm: any) => {
//         const farmWeekAgo = farmsOneWeekAgo.find((oldFarm: any) => oldFarm.id === farm.id);
//         // In case farm is too new to estimate LP APR (i.e. not returned in farmsOneWeekAgo query) - return 0
//         let lpApr = new BigNumber(0);
//         if (farmWeekAgo) {
//           const volume7d = new BigNumber(farm.volumeUSD).minus(new BigNumber(farmWeekAgo.volumeUSD));
//           const lpFees7d = volume7d.times(this.LP_HOLDERS_FEE);
//           const lpFeesInAYear = lpFees7d.times(this.WEEKS_IN_A_YEAR);
//           // Some untracked pairs like KUN-QSD will report 0 volume
//           if (lpFeesInAYear.gt(0)) {
//             const liquidity = new BigNumber(farm.reserveUSD);
//             lpApr = lpFeesInAYear.times(100).dividedBy(liquidity);
//           }
//         }
//         return {
//           ...aprMap,
//           [farm.id]: lpApr.decimalPlaces(2).toNumber(),
//         };
//       }, {} as AprMap);
//     } catch (error) {
//       throw new Error(`[LP APR Update] Failed to fetch LP APR data: ${error}`);
//     }
//   }

async getAprsForFarmGroup(addresses: string[], blockWeekAgo: number, chainId: number) {
    try {

      // this.apollo.create({
      //   cache: new InMemoryCache(),
      //   link: this.httpLink.create({ uri: 'https://bsc.streamingfast.io/subgraphs/name/pancakeswap/exchange-v2' }),
      // });
      const API_URL = 'https://bsc.streamingfast.io/subgraphs/name/pancakeswap/exchange-v2';
      const CORS_PROXY_URL = 'https://cors-anywhere.herokuapp.com/';

      this.resetLink(CORS_PROXY_URL + API_URL);

      const methods = `GET, HEAD, OPTIONS`
      const headers = `referer, origin, content-type`

      const corsHeaders = {
        'Access-Control-Allow-Origin': 'http://localhost:4200',
        'Access-Control-Allow-Methods': methods,
        'Access-Control-Allow-Headers': headers,
      }
      var response = await this.apollo.watchQuery({
        query: gql`
        query farmsBulk($addresses: [String]!, $blockWeekAgo: Int!) {
          farmsAtLatestBlock: pairs(first: 30, where: { id_in: $addresses }) {
            id
            volumeUSD
            reserveUSD
          }
          farmsOneWeekAgo: pairs(first: 30, where: { id_in: $addresses }, block: { number: $blockWeekAgo }) {
            id
            volumeUSD
            reserveUSD
          }
        }
               `,
               variables: { addresses, blockWeekAgo },
      }).valueChanges.subscribe(e =>{
        console.log(e);
      });

      // const response = await this.apollo.query<FarmsResponse>({
      //   query: gql`
      //   query farmsBulk($addresses: [String]!, $blockWeekAgo: Int!) {
      //     farmsAtLatestBlock: pairs(first: 30, where: { id_in: $addresses }) {
      //       id
      //       volumeUSD
      //       reserveUSD
      //     }
      //     farmsOneWeekAgo: pairs(first: 30, where: { id_in: $addresses }, block: { number: $blockWeekAgo }) {
      //       id
      //       volumeUSD
      //       reserveUSD
      //     }
      //   }
      //   `,
      //   variables: { addresses: addresses, blockWeekAgo: blockWeekAgo }
      // }).toPromise();

      // const { farmsAtLatestBlock, farmsOneWeekAgo } = (response as ApolloQueryResult<FarmsResponse>).data;
      // return farmsAtLatestBlock.reduce((aprMap, farm) => {
      //   const farmWeekAgo = farmsOneWeekAgo.find((oldFarm) => oldFarm.id === farm.id);
      //   // In case farm is too new to estimate LP APR (i.e. not returned in farmsOneWeekAgo query) - return 0
      //   let lpApr = new BigNumber(0);
      //   if (farmWeekAgo) {
      //     const volume7d = new BigNumber(farm.volumeUSD).minus(new BigNumber(farmWeekAgo.volumeUSD));
      //     const lpFees7d = volume7d.times(this.LP_HOLDERS_FEE);
      //     const lpFeesInAYear = lpFees7d.times(this.WEEKS_IN_A_YEAR);
      //     // Some untracked pairs like KUN-QSD will report 0 volume
      //     if (lpFeesInAYear.gt(0)) {
      //       const liquidity = new BigNumber(farm.reserveUSD);
      //       lpApr = lpFeesInAYear.times(100).dividedBy(liquidity);
      //     }
      //   }
      //   return {
      //     ...aprMap,
      //     [farm.id]: lpApr.decimalPlaces(2).toNumber(),
      //   };
      // }, {} as AprMap);
    } catch (error) {
      throw new Error(`[LP APR Update] Failed to fetch LP APR data: ${error}`);
    }
  }

  // async getBlockAtTimestamp(timestamp: number, chainId = ChainId.BSC) {
  //   try {

  //     this.apollo.create({
  //       cache: new InMemoryCache(),
  //       link: this.httpLink.create({ uri: 'https://api.thegraph.com/subgraphs/name/pancakeswap/blocks' }),
  //     });

  //     const result = await this.apollo.query({
  //       query: gql`
  //         query getBlock($timestampGreater: Int!, $timestampLess: Int!) {
  //           blocks(first: 1, where: { timestamp_gt: $timestampGreater, timestamp_lt: $timestampLess }) {
  //             number
  //           }
  //         }
  //       `,
  //       variables: { timestampGreater: timestamp, timestampLess: timestamp + 600 }
  //     }).toPromise();

  //     const blocks = (result as ApolloQueryResult<any>).data['blocks'];
  //     return parseInt(blocks[0].number, 10);
  //   } catch (error) {
  //     throw new Error(`Failed to fetch block number`);
  //   }
  // }

}
