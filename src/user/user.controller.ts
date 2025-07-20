import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth'; // Importar el guardia JWT 
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { AuthGuard } from '@nestjs/passport'; // Importar AuthGuard para proteger las rutas

@UseGuards(AuthGuard('jwt')) // Aplicar el guardia JWT a este controlador
// Esto asegura que todas las rutas de este controlador requieren autenticación JWT
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }
   //GET para obtener el perfil del usuario autenticado
  @UseGuards(JwtAuthGuard) // Aplicar el guardia JWT a este endpoint
  @Get('me')
  async getProfile(@GetUser() user: any) {
    console.log('Usuario recibido del JWT:', user);
    // Aquí puedes usar el usuario autenticado para obtener más información
    return { message:'Peril del usuario autenticado',user}
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
 
}
