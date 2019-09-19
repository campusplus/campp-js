/*
* @Author: Tai Dong <dongtaiit@gmail.com>
* @Date:   2019-09-09 22:47:14
* @Last Modified by:   Tai Dong
* @Last Modified time: 2019-09-19 11:33:46
*/

import axios from 'axios'
let self

class Post {
  constructor(config) {
    this.routeRegex = {
      PostsIndex: /(@[\w\.\d-]+)\/feed\/?$/,
      UserProfile1: /(@[\w\.\d-]+)\/?$/,
      UserProfile2: /(@[\w\.\d-]+)\/(blog|posts|comments|transfers|curation-rewards|author-rewards|permissions|created|recent-replies|feed|password|followed|followers|settings)\/?$/,
      UserProfile3: /(@[\w\.\d-]+)\/[\w\.\d-]+/,
      CategoryFilters: /(hot|trending|promoted|payout|payout_comments|created)\/?$/gi,
      PostNoCategory: /(@[\w\.\d-]+)\/([\w\d-]+)/,
      Post: /([\w\d\-\/]+)\/(\@[\w\d\.-]+)\/([\w\d-]+)\/?($|\?)/,
      PostJson: /([\w\d\-\/]+)\/(\@[\w\d\.-]+)\/([\w\d-]+)(\.json)$/,
      UserJson: /(@[\w\.\d-]+)(\.json)$/,
      UserNameJson: /^.*(?=(\.json))/,
    }
    this.config = config
    self = this

  }

  _formatPostContent(post){
    if(!post)
      return post

      let tags = post.tags || []
      let body = post.content || post.shortDesc

      return {
        "post_id": post.postId,
        "author": post.user.username,
        "permlink": post.postId,
        "category": tags[0] || 'unknown',
        "title": post.title,
        "body": body,
        "json_metadata": JSON.stringify({
          "image": [post.thumbnail]
        }),
        "created": new Date(post.createdAt),
        "last_update": new Date(post.updatedAt),
        "depth": 0,
        "children": post.count_comment,
        "share_count": post.count_share || 0,
        "net_rshares": 425554588016215,
        "last_payout": new Date(post.createdAt),
        "cashout_time": new Date(),
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
  }
  _buildData(path, posts, type) {
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
        "trending": []

      },
      "discussion_idx": {
        "": {}
      }
    }
    let discussionIdx
    if(type){
      result.discussion_idx[""][type] = result.discussion_idx[""][type] || []
      discussionIdx = result.discussion_idx[""][type]
    }
    
    let tagsTemp = {}

    posts.map(post => {
      post.tags.map(tag => {
        if (!tagsTemp[tag]) {
          tagsTemp[tag] = 1
          result.tag_idx.trending.push(tag)
        }
      })
      if(discussionIdx)
        discussionIdx.push(`${post.user.username}/${post.postId}`)

      result.content[`${post.user.username}/${post.postId}`] = self._formatPostContent(post)
    })

    return result
  }

  /*
   {
     tag,
     limit,
     start_author,
     start_permlink
   }     
   */
  async getDiscussionsByTrendingAsync(query){
    console.log('query getDiscussionsByTrendingAsync', query, typeof query)
    let url = `${self.config.campp_api}/posts?type=hot&pageSize=${query.pageSize || 10}&lastPostId=${query.start_permlink || 0}`
    if(query.tag)
      url += `&tag=${query.tag}`
    const posts = await axios.get(url)
      .then(res => {
        return res.data.data
      })
      .catch(ex =>{
        console.log('ex', ex)
        return null
      })
    return posts.map(item => self._formatPostContent(item))
  }

  _buildPostAPI(path){
    path = decodeURIComponent(path)
    let url = `${self.config.campp_api}/posts`
    let match = path.match(self.routeRegex.PostsIndex) //user's feed
    if(match){
      url += `?type=feed`
      return {url, type: 'feed'}
    }

    match = path.match(self.routeRegex.UserProfile1) //user's posts
    if(match){
      url += `?type=new&username=${match[1]}`
      return {url}
    }

    match = path.match(self.routeRegex.Post) //post detail: /trending/@tino/perm-link
    if(match){
      url += `?type=new&id=${match[3]}`
      return {url}
    }

    match = path.match(self.routeRegex.PostNoCategory) //@tino/some-tag
    if(match){
      let postId = match[2]
      url += `?type=new&username=${match[1].replace('@', '')}&tag=${match[2]}`
      return {url}
    }

    match =
        path.match(
            /(hot|trending|promoted|payout|payout_comments|created)\/?$/
        ) ||
        path.match(
            /(hot|trending|promoted|payout|payout_comments|created)\/([\w\s\d-]+)\/?$/
        );
    if (match) {
        url += `?type=${match[1] == 'created'? 'new' : 'hot'}`
        if(match[2])
          url += `&tag=${match[2]}`
        return {url, type: match[1]}
    }

    return {
      url,
      type
    }
  }

  async getStateAsync(path = 'trending', accessToken) {
    console.log('getStateAsync', path)

    let {url, type} = self._buildPostAPI(path)

    let options = {
      validateStatus: function (status) {
        return status >= 200 && status < 500;
      }
    }

    if(accessToken){
      options.headers = {
        Authorization: `Bearer ${accessToken}`
      }
    }
    console.log('url', url)
    const posts = await axios.get(url, options)
      .then(res => {
        if(res.data.error){
          console.error('fetch API error', JSON.stringify(res.data.error, null, 2))
          return null;
        }

        return res.data.data;
      })
      .catch(ex =>{
        console.log('ex', ex)
        return null
      })

    return self._buildData(path, posts, type);
  }

  async getTopAuthorAsync(){
    let url = `${self.config.campp_api}/users/top-authors`
    return axios.get(url, {
      validateStatus: function (status) {
        return status >= 200 && status < 500;
      }
    })
      .then(res => {
        if(res.data.error){
          console.error('fetch API error', JSON.stringify(res.data.error, null, 2))
          return null;
        }

        return res.data.data;
      })
      .catch(ex =>{
        console.log('ex', ex)
        return []
      })
  }
}

exports = module.exports = Post