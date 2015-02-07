if(typeof(PasswordMaker_HashUtils)!="object"){var PasswordMaker_HashUtils={chrsz:8,str2rstr_utf8:function(input){var output="";var i=-1;var x,y;while(++i<input.length)
{x=input.charCodeAt(i);y=i+ 1<input.length?input.charCodeAt(i+ 1):0;if(0xD800<=x&&x<=0xDBFF&&0xDC00<=y&&y<=0xDFFF)
{x=0x10000+((x&0x03FF)<<10)+(y&0x03FF);i++;}
if(x<=0x7F)
output+=String.fromCharCode(x);else if(x<=0x7FF)
output+=String.fromCharCode(0xC0|((x>>>6)&0x1F),0x80|(x&0x3F));else if(x<=0xFFFF)
output+=String.fromCharCode(0xE0|((x>>>12)&0x0F),0x80|((x>>>6)&0x3F),0x80|(x&0x3F));else if(x<=0x1FFFFF)
output+=String.fromCharCode(0xF0|((x>>>18)&0x07),0x80|((x>>>12)&0x3F),0x80|((x>>>6)&0x3F),0x80|(x&0x3F));}
return output;},rstr2binl:function(input){var output=Array(input.length>>2);for(var i=0;i<output.length;i++)
output[i]=0;for(var i=0;i<input.length*8;i+=8)
output[i>>5]|=(input.charCodeAt(i/8)&0xFF)<<(i%32);return output;},binl2rstr:function(input){var output="";for(var i=0;i<input.length*32;i+=8)
output+=String.fromCharCode((input[i>>5]>>>(i%32))&0xFF);return output;},rstr2any:function(input,encoding){var divisor=encoding.length;var remainders=Array();var i,q,x,quotient;var dividend=Array(input.length/2);var inp=new String(input);for(i=0;i<dividend.length;i++){dividend[i]=(inp.charCodeAt(i*2)<<8)|inp.charCodeAt(i*2+ 1);}
while(dividend.length>0){quotient=Array();x=0;for(i=0;i<dividend.length;i++){x=(x<<16)+ dividend[i];q=Math.floor(x/divisor);x-=q*divisor;if(quotient.length>0||q>0)
quotient[quotient.length]=q;}
remainders[remainders.length]=x;dividend=quotient;}
var output="";for(i=remainders.length- 1;i>=0;i--)
output+=encoding.charAt(remainders[i]);return output;},rstr2binb:function(input){var output=Array(input.length>>2);for(var i=0;i<output.length;i++)
output[i]=0;for(var i=0;i<input.length*8;i+=8)
output[i>>5]|=(input.charCodeAt(i/8)&0xFF)<<(24- i%32);return output;},binb2rstr:function(input){var output="";for(var i=0;i<input.length*32;i+=8)
output+=String.fromCharCode((input[i>>5]>>>(24- i%32))&0xFF);return output;},bit_rol:function(num,cnt){return(num<<cnt)|(num>>>(32- cnt));},safe_add:function(x,y){var lsw=(x&0xFFFF)+(y&0xFFFF);var msw=(x>>16)+(y>>16)+(lsw>>16);return(msw<<16)|(lsw&0xFFFF);}}}