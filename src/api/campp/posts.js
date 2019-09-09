/*
* @Author: Tai Dong <dongtaiit@gmail.com>
* @Date:   2019-09-09 22:47:14
* @Last Modified by:   Tai Dong
* @Last Modified time: 2019-09-09 23:06:44
*/

import axios from 'axios'
let self

class Post {
  constructor(config) {
    this.routeRegex = {
      PostsIndex: /^\/(@[\w\.\d-]+)\/feed\/?$/,
      UserProfile1: /^\/(@[\w\.\d-]+)\/?$/,
      UserProfile2: /^\/(@[\w\.\d-]+)\/(blog|posts|comments|transfers|curation-rewards|author-rewards|permissions|created|recent-replies|feed|password|followed|followers|settings)\/?$/,
      UserProfile3: /^\/(@[\w\.\d-]+)\/[\w\.\d-]+/,
      CategoryFilters: /^\/(hot|trending|promoted|payout|payout_comments|created)\/?$/gi,
      PostNoCategory: /^\/(@[\w\.\d-]+)\/([\w\d-]+)/,
      Post: /^\/([\w\d\-\/]+)\/(\@[\w\d\.-]+)\/([\w\d-]+)\/?($|\?)/,
      PostJson: /^\/([\w\d\-\/]+)\/(\@[\w\d\.-]+)\/([\w\d-]+)(\.json)$/,
      UserJson: /^\/(@[\w\.\d-]+)(\.json)$/,
      UserNameJson: /^.*(?=(\.json))/,
    }
    this.config = config
    self = this

  }


  _buildData(path, posts) {
    posts = posts || []
    const orignalPath = path.split('/')[0]
    const now = new Date()
    let result = {
      "feed_price": {
        "base": "0.210 USD",
        "quote": "1.000 MCASH"
      },
      "props": {
        "time": now,
        "sbd_print_rate": 0,
        "sbd_interest_rate": 0,
        "head_block_number": 36253942,
        "total_vesting_shares": "396853140515.514648 VESTS",
        "total_vesting_fund_steem": "200344821.392 STEEM",
        "last_irreversible_block_num": 36253924
      },
      "tags": {},
      "accounts": {},
      "content": {},
      "tag_idx": {

      },
      "discussion_idx": {
        "": {
          "trending": []
        }
      }
    }

    let discussionIdx = result.discussion_idx[""].trending
    result.tag_idx[orignalPath] = result.tag_idx[orignalPath] || []
    let tags = result.tag_idx[orignalPath] || []
    let tagsTemp = {}

    posts.map(post => {
      post.tags.map(tag => {
        if (!tagsTemp[tag]) {
          tagsTemp[tag] = 1
          tags.push(tag)
        }
      })

      discussionIdx.push(`${post.user.username}/${post.postId}`)

      let body = post.content || post.shortDesc
      result.content[`${post.user.username}/${post.postId}`] = {
        "post_id": post.postId,
        "author": post.user.username,
        "permlink": post.postId,
        "category": tags[0] || 'unknown category',
        "title": post.title,
        "body": body,
        "json_metadata": JSON.stringify({
          "image": [post.thumbnail]
        }),
        "created": new Date(post.createdAt),
        "last_update": new Date(post.updatedAt),
        "depth": 0,
        "children": post.count_comment,
        "net_rshares": 425554588016215,
        "last_payout": new Date(post.createdAt),
        "cashout_time": now,
        "total_payout_value": "0.000 USD",
        "curator_payout_value": "0.000 USD",
        "pending_payout_value": post.totalReward + " USD",
        "promoted": "0.000 USD",
        "replies": [],
        "body_length": body.length,
        "active_votes": [],
        "author_reputation": 21765957547111,
        "parent_author": "",
        "parent_permlink": post.user.username,
        "url": `/${tags[0]}/${post.user.username}/${post.postId}`,
        "root_title": post.title,
        "beneficiaries": [],
        "max_accepted_payout": "1000000.000 USD",
        "percent_steem_dollars": 10000
      }
    })

    return result
  }

  async getStateAsync(path = 'trending') {
    path = decodeURIComponent(path)

    const orignalPath = path.split('/')[0]

    let url = `http://${self.config.campp_api}/posts`

    switch (orignalPath) {
      case 'created':
        {
          url += '?type=new'
          break;
        }
      case 'hot':
      case 'trending':
        {
          url += '?type=hot'
          if(orignalPath[1]){
            url += `&tag=${orignalPath[1]}`
          }
          break;
        }

      default:
        {
          if (/\w+\/@\w+\/[\w, -]+/.test(path)) {
            const paths = path.split('/')
            url += `?type=posts&id=${paths[paths.length - 1]}`
          }

          break
        }
    }

    const posts = await axios.get(url)
      .then(res => {
        return res.data.data
      })
      .catch(ex =>{
        console.log('ex', ex)
        return null
      })

    return self._buildData(path, posts);
  }

  async getDiscussionsByTrendingAsync() {

  }
}

exports = module.exports = Post