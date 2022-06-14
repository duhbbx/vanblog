import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InitDto } from 'src/dto/init.dto';
import { MetaDocument } from 'src/scheme/meta.schema';
import { UserDocument } from 'src/scheme/user.schema';

@Injectable()
export class InitProvider {
  constructor(
    @InjectModel('Meta') private metaModel: Model<MetaDocument>,
    @InjectModel('User') private userModel: Model<UserDocument>,
  ) {}

  async init(initDto: InitDto) {
    const { user, siteInfo } = initDto;
    try {
      await this.userModel.create({
        id: 0,
        name: user.username,
        password: user.password,
      });
      await this.metaModel.create({
        siteInfo,
        links: [],
        socials: [],
        rewards: [],
        about: {
          updatedAt: new Date(),
          content: '',
        },
        categories: [],
      });
      return '初始化成功!';
    } catch (err) {
      throw new Error('初始化失败');
    }
  }

  async checkHasInited() {
    const user = await this.userModel.findOne({}).exec();
    if (!user) {
      return false;
    }
    return true;
  }
}