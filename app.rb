
require 'sinatra'
require 'omniauth-twitter'
require 'twitter'
require 'json'

# load ./.env file
require 'dotenv'
Dotenv.load
puts "ENV['TWITTER_CONSUMER_KEY']: #{ENV['TWITTER_CONSUMER_KEY']}"

set :server, :thin
set :session_secret, DateTime.now.to_s

configure do
  enable :sessions
  use OmniAuth::Builder do
    provider :twitter, ENV['TWITTER_CONSUMER_KEY'], ENV['TWITTER_CONSUMER_SECRET']
  end
end

helpers do
  def logged_in?
    session[:twitter_oauth]
  end

  def twitter
    Twitter::REST::Client.new do |config|
      config.consumer_key        = ENV['TWITTER_CONSUMER_KEY']
      config.consumer_secret     = ENV['TWITTER_CONSUMER_SECRET']
      config.access_token        = session[:twitter_oauth][:token]
      config.access_token_secret = session[:twitter_oauth][:secret]
    end
  end
end

#before do
#  pass if request.path_info =~ /^\/auth\//
#  redirect to('/auth/twitter') unless logged_in?
#end

get '/auth/twitter/callback' do
  session[:twitter_oauth] = env['omniauth.auth'][:credentials]
  redirect to('/')
end

get '/auth/failure' do
end

get '/' do
  if session[:twitter_oauth].nil? then
    erb :login
  else
    @oauth = session[:twitter_oauth]
    @follower = []
    twitter.friend_ids.each_slice(100).each do |slice|
      twitter.users(slice).each do |friend|
        @follower << friend
      end
    end
    erb :index
  end
   
end

get '/csv' do
  csv = "name,screen_name,id"
  @follower = []
    twitter.friend_ids.each_slice(100).each do |slice|
      twitter.users(slice).each do |friend|
        @follower << friend
      end
    end
  @follower.each do |user|
    csv << "\n#{user.name},#{user.screen_name},#{user.id}"
  end

  content_type 'application/csv' , :charset=> 'utf-8' 
  attachment "twitter_follow.csv"
  csv
end

get '/login' do
  redirect to('/auth/twitter') unless logged_in?
end

get '/logout' do
  session.clear
  redirect to('/')
end
